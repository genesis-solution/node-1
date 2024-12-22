const app = require('../../app');
const supertest = require('supertest');
const User = require('../../app/model/User');
const bcrypt = require('bcrypt');
const { generateJwtToken } = require('../../app/utils/jwt');
const mongoose = require('mongoose');
const { ACCOUNT_DISABLED, ACCOUNT_NOT_VERIFIED } = require('../../app/errors/codes');
const { connect } = require('../../app/config/database');
const { Grant } = require('../../app/model/Grant');
const UserDetails = require('../../app/model/UserDetails');
const { ObjectId } = require('mongodb');
const debug = require('debug')('app:test:routes:auth');


describe('Routes: Auth', () => {
    let _doc;
    let connection;
    beforeAll(async () => {
        connection = await connect('test-auth-db');
        await Grant.create({
            role: 'anonymous',
            resource: 'user',
            action: 'create',
            attributes: ['*', '!role.admin', '!verified', '!disabled'],
            possession: 'any',
        });
    });

    beforeEach(async () => {
        jest.restoreAllMocks();
        _doc = new User({
            name: 'John Doe',
            email: 'test@test.com',
            password: '123',
            role: 'user',
            verified: true,
            disabled: false,
        });
        _doc.password = await bcrypt.hash(_doc.password, 10);

    });

    afterAll(async () => {
        await connection.disconnect();
    });
    afterEach(async () => {
        jest.restoreAllMocks();
        await User.deleteMany({});
    });


    describe('POST /api/auth/register', () => {
        beforeEach(async () => {
            await User.deleteMany({});
        });
        const _doc = {
            name: 'John Doe',
            email: "test@mail.com",
            password: '123',
            role: 'user',
        };
        it("should return a new user", async () => {

            const createUser = jest.spyOn(User, 'create');

            const response = await supertest(app)
                .post('/api/auth/register')
                .send(_doc).expect(201);
            expect(createUser).toHaveBeenCalledWith(_doc);

            const createdUser = createUser.mock.results[0].value;
            expect(createdUser.password).not.toBe(_doc.password);

            expect(response.body).toEqual({
                _id: expect.any(String),
                name: _doc.name,
                verified: false,
            });

        });
        it("should return a new user with firstName, lastName", async () => {

            const createUser = jest.spyOn(User, 'create');
            const createUserDetails = jest.spyOn(UserDetails.collection, 'insertOne');

            const response = await supertest(app)
                .post('/api/auth/register')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: _doc.email,
                    password: _doc.password,
                    role: _doc.role
                }).expect(201);
            expect(createUser).toHaveBeenCalledWith({
                ..._doc, 
                firstName: 'John',
                lastName: 'Doe',
            });
            const createdUser = await createUser.mock.results[0].value;
            expect(createUserDetails).toHaveBeenCalledWith({
                _id: expect.any(ObjectId),
                firstName: 'John',
                lastName: 'Doe',
                user: createdUser._id,
            });
            expect(createdUser.password).not.toBe(_doc.password);

            expect(response.body).toEqual({
                _id: expect.any(String),
                name: _doc.name,
                verified: false,
            });

        });

        it("should return 400 on dublicate data", async () => {
            jest.spyOn(User, 'create').mockRejectedValue(new mongoose.Error.ValidationError());
            const response = await supertest(app)
                .post('/api/auth/register')
                .send({ name: 'John Doe', email: "test@test.com", password: '123', role: 'user' });

            expect(response.status).toBe(400);
        });
        it("should return 500 on error", async () => {
            jest.spyOn(User, 'findOne').mockRejectedValue(new Error());
            const response = await supertest(app)
                .post('/api/auth/register')
                .send({ name: 'John Doe', email: "test@test.com", password: '123', role: 'user' });

            expect(response.status).toBe(500);
        });

        it("sould return an error on invalid data", async () => {
            const createUser = jest.spyOn(User, 'create');
            const response = await supertest(app)
                .post('/api/auth/register')
                .send({ name: 'John Doe', role: 'user' }).expect(400);
            expect(createUser).toHaveBeenCalled();
        });

        it("should return an error on duplicate email", async () => {
            jest.spyOn(User, 'findOne').mockResolvedValue(_doc);
            const response = await supertest(app)
                .post('/api/auth/register')
                .send({ name: 'John Doe', email: _doc.email, password: '123', role: 'user' });
            expect(response.status).toBe(400);
        });

        it("should filter roles based on grants", async () => {
            const createUSer = jest.spyOn(User, 'create');
            const findGrants = jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: 'anonymous', resource: 'user', action: 'create', attributes: ['name', 'role.test', 'email', 'password', '!verified', '!disabled'] }),
            ]);
            const filter = jest.spyOn(require('accesscontrol/lib/core/Permission').Permission.prototype, 'filter');
            const response = await supertest(app)
                .post('/api/auth/register')
                .send({ name: 'John Doe', email: 'test', password: '123', role: 'user' })
                .expect(403);
            expect(filter).toHaveBeenCalledWith({
                name: 'John Doe',
                email: 'test',
                password: '123',
                role: { 'user': 'user' }
            });
        });





    });

    describe('POST /api/auth/login', () => {
        beforeAll(async () => {
            jest.resetAllMocks();
        });

        it("should return a token", async () => {
            const findOneUser = jest.spyOn(User, 'findOne').mockResolvedValue(_doc);

            const response = await supertest(app)
                .post('/api/auth/login')
                .send({ email: _doc.email, password: '123' });
            const findOneResult = findOneUser.mock.results[0].value;
            expect(findOneUser).toHaveBeenCalledWith({ email: _doc.email });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.header).toHaveProperty('set-cookie');
        });

        it("should return an 401 on invalid email", async () => {
            jest.spyOn(User, 'findOne').mockResolvedValue(null);
            const response = await supertest(app)
                .post('/api/auth/login')
                .send({ email: 'invalid@test.com', password: '123' });
            expect(response.status).toBe(401); // Unauthorized
        });

        it("should return an 401  on invalid password", async () => {
            jest.spyOn(User, 'findOne').mockResolvedValue(_doc);
            const response = await supertest(app)
                .post('/api/auth/login')
                .send({ email: _doc.email, password: 'invalid' });
            expect(response.status).toBe(401); // Unauthorized
        });
        it("should return an 400 on invalid password type", async () => {
            jest.spyOn(User, 'findOne').mockResolvedValue(_doc);
            const response = await supertest(app)
                .post('/api/auth/login')
                .send({ email: _doc.email, password: 123 });
            expect(response.status).toBe(400); // Unauthorized
        });

        it("should return an error 500 on error", async () => {
            const findOne = jest.spyOn(User, 'findOne').mockRejectedValue(new Error());
            const response = await supertest(app)
                .post('/api/auth/login')
                .send({ email: _doc.email, password: '123' });
            expect(response.status).toBe(500);
            findOne.mockRestore();
        });

        it("should return an error 423 locked on 2FA enabled", async () => {
            const findOne = jest.spyOn(User, 'findOne').mockResolvedValue(new User({ ..._doc.toObject(), twoFactorAuthEnabled: true }));
            const response = await supertest(app)
                .post('/api/auth/login')
                .send({ email: _doc.email, password: '123' });
            expect(response.status).toBe(423);
            findOne.mockRestore();
        });

        it("should return an error 404 not found on account is disabled", async () => {
            const findOne = jest.spyOn(User, 'findOne').mockResolvedValue(new User({ ..._doc.toObject(), disabled: true }));
            const response = await supertest(app)
                .post('/api/auth/login')
                .send({ email: _doc.email, password: '123' });
            expect(response.status).toBe(404);
            expect(response.body.code).toBe(ACCOUNT_DISABLED.code);
            findOne.mockRestore();
        });
        it("should return an error 404 not dound on account is not verified", async () => {
            const findOne = jest.spyOn(User, 'findOne').mockResolvedValue(new User({ ..._doc.toObject(), verified: false }));

            const response = await supertest(app)
                .post('/api/auth/login')
                .send({ email: _doc.email, password: '123' });
            expect(response.status).toBe(404);
            expect(response.body.code).toBe(ACCOUNT_NOT_VERIFIED.code);
            findOne.mockRestore();
        });
    });

    describe('GET /api/auth/me', () => {

        it("should return a user without password using cookie", async () => {
            jest.spyOn(User, 'findOne').mockResolvedValue(_doc);
            const token = _doc.generateToken();
            const response = await supertest(app)
                .get('/api/auth/me')
                .set('Cookie', `token=${token}`);
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                token: expect.any(String),
                user: {
                    ..._doc.toObject(),
                    _id: _doc._id.toString()
                }
            });
            expect(response.body.user).not.toHaveProperty('password');
        });
        it("should return a user without password using Auth bearer", async () => {
            jest.spyOn(User, 'findOne').mockResolvedValue(_doc);
            const token = generateJwtToken({ id: _doc._id, role: _doc.role });
            const response = await supertest(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                token: expect.any(String),
                user: {
                    ..._doc.toObject(),
                    _id: _doc._id.toString()
                }
            });
            expect(response.body.user).not.toHaveProperty('password');
        });

        it("should return an error 401 without cookie", async () => {
            const response = await supertest(app)
                .get('/api/auth/me');
            expect(response.status).toBe(401);
        });

        it("should return an error 401 with invalid token", async () => {
            const response = await supertest(app)
                .get('/api/auth/me')
                .set('Cookie', `token=invalid`);
            expect(response.status).toBe(401);
        });

        it("should return an error 401 with expired token", async () => {
            const token = generateJwtToken({ id: _doc._id, role: _doc.role }, { expiresIn: '1ms' });
            const response = await supertest(app)
                .get('/api/auth/me')
                .set('Cookie', `token=${token}`);
            expect(response.status).toBe(401);
        });


    });

    describe('POST /api/auth/request-2fa-token', () => {
        const END_POINT = '/api/auth/request-2fa-token';
        it('should not return 404', async () => {
            const response = await supertest(app).post(END_POINT);
            expect(response.status).not.toBe(404);
        });

        it('should return 400 on invalid data', async () => {
            const response = await supertest(app).post(END_POINT).send({});
            expect(response.status).toBe(400);
        });

        it('should return 401 on invalid email', async () => {
            const userAuthenticate = jest.spyOn(User, 'authenticate').mockResolvedValue(null);
            const response = await supertest(app).post(END_POINT).send({ email: 'invalid', password: '123' });
            expect(response.status).toBe(401);
            expect(userAuthenticate).toHaveBeenCalled();
        });

        it('should return 200 on valid data', async () => {
            const userAuthenticate = jest.spyOn(User, 'authenticate').mockResolvedValue(_doc);
            const sendEmail2FA = jest.spyOn(require('../../app/service/mail'), 'sendEmail2FA').mockResolvedValue();
            const response = await supertest(app).post(END_POINT).send({ email: _doc.email, password: '123' });
            expect(response.status).toBe(200);
            expect(sendEmail2FA).toHaveBeenCalledWith(_doc.email, expect.any(String));
            expect(userAuthenticate).toHaveBeenCalled();
        });

        it('should return 500 on error', async () => {
            const userAuthenticate = jest.spyOn(User, 'authenticate').mockRejectedValue(new Error());
            const response = await supertest(app).post(END_POINT).send({ email: _doc.email, password: '123' });
            expect(response.status).toBe(500);
            expect(userAuthenticate).toHaveBeenCalled();
        });

    });

    describe('POST /api/auth/verify-2fa-token', () => {
        it('should not return 404', async () => {
            const response = await supertest(app).post('/api/auth/verify-2fa-token');
            expect(response.status).not.toBe(404);
        });

        it('should return 400 on invalid data', async () => {
            const response = await supertest(app).post('/api/auth/verify-2fa-token').send({});
            expect(response.status).toBe(400);
        });

        it('should return 400 on invalid token', async () => {
            const response = await supertest(app).post('/api/auth/verify-2fa-token')
                .send({ token: 'invalid' });
            expect(response.status).toBe(400);
        });

        it('should return 400 on invalid token for 2fa', async () => {
            const token = generateJwtToken({ _id: _doc._id, for: 'invalid' });
            const response = await supertest(app).post('/api/auth/verify-2fa-token')
                .send({ token });
            expect(response.status).toBe(400);
        });
        it('should return 404 on invalid user', async () => {
            const token = generateJwtToken({ _id: _doc._id, for: '2fa' });
            const response = await supertest(app).post('/api/auth/verify-2fa-token')
                .send({ token });
            expect(response.status).toBe(404);
        });

        it('should return 404 on disabled user', async () => {
            const token = generateJwtToken({ _id: _doc._id, for: '2fa' });
            const user = new User({ ..._doc.toObject(), disabled: true });
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const response = await supertest(app).post('/api/auth/verify-2fa-token')
                .send({ token });
            expect(response.status).toBe(404);
            expect(response.body).toEqual(ACCOUNT_DISABLED);
        });

        it('should return 200 on valid token', async () => {
            const token = generateJwtToken({ _id: _doc._id, for: '2fa' });
            const user = new User(_doc.toObject());
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const response = await supertest(app).post('/api/auth/verify-2fa-token')
                .send({ token });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.password).toBeUndefined();
        });

        it('should handle error', async () => {
            const token = generateJwtToken({ _id: _doc._id, for: '2fa' });
            jest.spyOn(User, 'findById').mockRejectedValue(new Error());
            const response = await supertest(app).post('/api/auth/verify-2fa-token')
                .send({ token });
            expect(response.status).toBe(500);
        });

    });

    describe('POST /api/auth/request-verification', () => {
        it('should not return 404', async () => {
            const response = await supertest(app).post('/api/auth/request-verification');
            expect(response.status).not.toBe(404);
        });

        it('should return 400 on invalid data', async () => {
            const response = await supertest(app).post('/api/auth/request-verification').send({});
            expect(response.status).toBe(400);
        });

        it('should return 404 on invalid user', async () => {
            const response = await supertest(app).post('/api/auth/request-verification')
                .send({ email: 'invalid' });
            expect(response.status).toBe(404);
        });

        it('should return 200 on valid data', async () => {
            const findUser = jest.spyOn(User, 'findOne').mockResolvedValue(_doc);
            const sendEmailVerification = jest.spyOn(require('../../app/service/mail'), 'sendEmailVerification').mockResolvedValue();
            const response = await supertest(app).post('/api/auth/request-verification')
                .send({ email: _doc.email });
            expect(response.status).toBe(200);
            expect(findUser).toHaveBeenCalledWith({ email: _doc.email });
            expect(sendEmailVerification).toHaveBeenCalledWith(_doc.email, expect.any(String));
        });

        it('should return 500 on error', async () => {
            jest.spyOn(User, 'findOne').mockRejectedValue(new Error());
            const response = await supertest(app).post('/api/auth/request-verification')
                .send({ email: _doc.email });
            expect(response.status).toBe(500);
        });

    });

    describe('POST /api/auth/confirm-verification', () => {
        it('should not return 404', async () => {
            const response = await supertest(app).post('/api/auth/confirm-verification');
            expect(response.status).not.toBe(404);
        });

        it('should return 400 on invalid data', async () => {
            const response = await supertest(app).post('/api/auth/confirm-verification').send({});
            expect(response.status).toBe(400);
        });

        it('should return 400 on invalid token', async () => {
            const response = await supertest(app).post('/api/auth/confirm-verification')
                .send({ token: 'invalid' });
            expect(response.status).toBe(400);
        });

        it('should return 400 on invalid token for email verification', async () => {
            const token = generateJwtToken({ _id: _doc._id, for: 'invalid' });
            const response = await supertest(app).post('/api/auth/confirm-verification')
                .send({ token });
            expect(response.status).toBe(400);
        });

        it('should return 404 on invalid user', async () => {
            const token = generateJwtToken({ _id: _doc._id, for: 'email-verification' });
            const response = await supertest(app).post('/api/auth/confirm-verification')
                .send({ token });
            expect(response.status).toBe(404);
        });

        it('should return 200 on valid token', async () => {
            const token = generateJwtToken({ _id: _doc._id, for: 'email-verification' });
            const user = new User(_doc.toObject());
            await user.save();
            const response = await supertest(app).post('/api/auth/confirm-verification')
                .send({ token });
            expect(response.status).toBe(200);

            const updatedUser = await User.findById(_doc._id);
            expect(updatedUser.verified).toBe(true);
        });

        it('should handle error', async () => {
            const token = generateJwtToken({ _id: _doc._id, for: 'email-verification' });
            jest.spyOn(User, 'findById').mockRejectedValue(new Error());
            const response = await supertest(app).post('/api/auth/confirm-verification')
                .send({ token });
            expect(response.status).toBe(500);
        });

    });

    describe('POST /api/auth/request-password-reset', () => {
        it('should not return 404', async () => {
            const response = await supertest(app).post('/api/auth/request-password-reset');
            expect(response.status).not.toBe(404);
        });

        it('should return 400 on invalid data', async () => {
            const response = await supertest(app).post('/api/auth/request-password-reset').send({});
            expect(response.status).toBe(400);
        });

        it('should return 404 on invalid user', async () => {
            const response = await supertest(app).post('/api/auth/request-password-reset')
                .send({ email: 'invalid' });
            expect(response.status).toBe(404);
        });

        it('should return 200 on valid data', async () => {
            const findUser = jest.spyOn(User, 'findOne').mockResolvedValue(_doc);
            const generateJwtToken = jest.spyOn(require('../../app/utils/jwt'), 'generateJwtToken');
            const sendEmailForgotPassword = jest.spyOn(require('../../app/service/mail'), 'sendEmailForgotPassword').mockResolvedValue();
            const response = await supertest(app).post('/api/auth/request-password-reset')
                .send({ email: _doc.email });
            expect(response.status).toBe(200);
            expect(findUser).toHaveBeenCalledWith({ email: _doc.email });
            expect(generateJwtToken).toHaveBeenCalledWith({ _id: _doc._id, for: 'password-reset', ip: expect.any(String) }, expect.any(Object));
            expect(sendEmailForgotPassword).toHaveBeenCalledWith(_doc.email, expect.any(String));
        });

        it('should return 500 on error', async () => {
            jest.spyOn(User, 'findOne').mockRejectedValue(new Error());
            const response = await supertest(app).post('/api/auth/request-password-reset')
                .send({ email: _doc.email });
            expect(response.status).toBe(500);
        });

    });

    describe('POST /api/auth/confirm-password-reset', () => {
        it('should not return 404', async () => {
            const response = await supertest(app).post('/api/auth/confirm-password-reset');
            expect(response.status).not.toBe(404);
        });

        it('should return 400 on invalid data', async () => {
            const response = await supertest(app).post('/api/auth/confirm-password-reset').send({});
            expect(response.status).toBe(400);
        });

        it('should return 400 on invalid token', async () => {
            const jwtVerify = jest.spyOn(require('../../app/utils/jwt'), 'verify');
            const response = await supertest(app).post('/api/auth/confirm-password-reset')
                .send({ token: 'invalid', password: '123' });

            expect(response.status).toBe(400);
            expect(jwtVerify).toThrow();
        });

        it('should return 400 on invalid token for password reset', async () => {
            const token = generateJwtToken({ _id: _doc._id, for: 'invalid' });
            const findById = jest.spyOn(User, 'findById');
            const response = await supertest(app).post('/api/auth/confirm-password-reset')
                .send({ token, password: '123' });
            expect(response.status).toBe(400);
            expect(findById).not.toHaveBeenCalled();
        });

        it('should return 404 on invalid user', async () => {
            const token = generateJwtToken({ _id: _doc._id, for: 'password-reset' });
            jest.spyOn(User, 'findById').mockResolvedValue(null);
            const response = await supertest(app).post('/api/auth/confirm-password-reset')
                .send({ token, password: '123', confirmPassword: '123' });
            expect(response.status).toBe(401);
        });

        it('should return 400 on invalid confirmPassword password', async () => {
            const token = generateJwtToken({ _id: _doc._id, for: 'password-reset' });
            const findById = jest.spyOn(User, 'findById').mockResolvedValue(new User(_doc.toObject()));
            const response = await supertest(app).post('/api/auth/confirm-password-reset')
                .send({ token, password: '123', confirmPassword: 'invalid' });
            expect(response.status).toBe(400);
            expect(findById).not.toHaveBeenCalled();
        });

        it('should return 200 on valid token', async () => {
            const token = generateJwtToken({ _id: _doc._id, for: 'password-reset' });
            const user = new User(_doc.toObject());
            await user.save();
            const response = await supertest(app).post('/api/auth/confirm-password-reset')
                .send({ token, password: '123', confirmPassword: '123' });
            expect(response.status).toBe(200);
            const updatedUser = await User.findById(_doc._id);
            expect(updatedUser.password).not.toBe(_doc.password);
        });

        it('should handle error', async () => {
            const token = generateJwtToken({ _id: _doc._id, for: 'password-reset' });
            const user = new User(_doc.toObject());
            const findById = jest.spyOn(User, 'findById').mockRejectedValue(new Error());
            const response = await supertest(app).post('/api/auth/confirm-password-reset')
                .send({ token, password: '123', confirmPassword: '123' });
            expect(response.status).toBe(500);
        });

    });

    describe('POST /api/auth/logout', () => {
        it('should not return 404', async () => {
            const response = await supertest(app).post('/api/auth/logout');
            expect(response.status).not.toBe(404);
        });

        it('should return 200 on valid data', async () => {
            const response = await supertest(app).post('/api/auth/logout');
            expect(response.status).toBe(200);
            expect(response.header).toHaveProperty('set-cookie');
        });

    });

    describe('DELETE /api/auth/user/:id?', () => {
        it('should not return 404', async () => {
            const response = await supertest(app).delete('/api/auth/user');
            expect(response.status).not.toBe(404);
        });

        it('should return 401 on invalid token', async () => {
            const response = await supertest(app).delete('/api/auth/user');
            expect(response.status).toBe(401);
        });

        it('should return 403 on invalid user role', async () => {
            const token = generateJwtToken({ _id: _doc._id, role: _doc.role });
            jest.spyOn(User, 'findById').mockResolvedValue(new User(_doc.toObject()));
            jest.spyOn(Grant, 'find').mockResolvedValue([]);
            const response = await supertest(app)
                .delete('/api/auth/user')
                .set('Authorization', `Bearer ${token}`)
                .expect(403);
        });

        it('should delete own user', async () => {
            const token = generateJwtToken({ id: _doc._id, role: _doc.role });
            const user = new User(_doc.toObject());
            await user.save();
            const findByIdAndDeleteUser = jest.spyOn(User, 'findByIdAndDelete');
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: 'user', resource: 'user', action: 'delete', attributes: ['*'], possession: 'own', }),
            ]);
            const response = await supertest(app).delete('/api/auth/user')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            const deletedUser = await User.findById(_doc._id);
            expect(deletedUser).toBeNull();
            expect(findByIdAndDeleteUser).toHaveBeenCalledWith(user._id);
        });

        it('should not delete other user if dont have deleteAny permission', async () => {
            const token = generateJwtToken({ id: _doc._id, role: _doc.role });
            const user = new User(_doc.toObject());
            await user.save();
            const otherUser = new User({
                name: 'Jane Doe',
                email: 'test@test.co',
                password: '123',
                role: 'user',
                verified: true,
                disabled: false,
            });
            await otherUser.save();
            const findByIdAndDeleteUser = jest.spyOn(User, 'findByIdAndDelete');
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: 'user', resource: 'user', action: 'delete', attributes: ['*'], possession: 'own' }),
            ]);
            const response = await supertest(app)
                .delete(`/api/auth/user/${otherUser._id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            const deletedUser = await User.findById(otherUser._id);
            expect(deletedUser).not.toBeNull();
            expect(findByIdAndDeleteUser).toHaveBeenCalledWith(user._id);
        });

        it('should handle error', async () => {
            const token = generateJwtToken({ id: _doc._id, role: _doc.role });
            const user = new User(_doc.toObject());
            await user.save();
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: 'user', resource: 'user', action: 'delete', attributes: ['*'], possession: 'own' }),
            ]);
            jest.spyOn(User, 'findByIdAndDelete').mockRejectedValue(new Error());
            const response = await supertest(app).delete('/api/auth/user')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(500);
        });

        it('should delete other user if have deleteAny permission', async () => {
            const token = generateJwtToken({ id: _doc._id, role: _doc.role });
            const user = new User(_doc.toObject());
            await user.save();
            const otherUser = new User({
                name: 'Jane Doe',
                email: 'test2@test.com',
                password: '123',
                role: 'user',
                verified: true,
                disabled: false,
            });
            await otherUser.save();
            const findByIdAndDeleteUser = jest.spyOn(User, 'findByIdAndDelete');
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: 'user', resource: 'user', action: 'delete', attributes: ['*'], possession: 'any' }),
            ]);
            const response = await supertest(app)
                .delete(`/api/auth/user/${otherUser._id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            const deletedUser = await User.findById(otherUser._id);
            expect(deletedUser).toBeNull();
            expect(findByIdAndDeleteUser).toHaveBeenCalledWith(otherUser._id.toString());
        });
    });

    describe('PATCH /api/auth/user/:id?', () => {
        it('should not return 404', async () => {
            const response = await supertest(app).patch('/api/auth/user');
            expect(response.status).not.toBe(404);
        });

        it('should return 401 on invalid token', async () => {
            const response = await supertest(app).patch('/api/auth/user');
            expect(response.status).toBe(401);
        });

        it('should return 403 on invalid user role', async () => {
            const token = generateJwtToken({ _id: _doc._id, role: _doc.role });
            jest.spyOn(User, 'findById').mockResolvedValue(new User(_doc.toObject()));
            jest.spyOn(Grant, 'find').mockResolvedValue([]);
            const response = await supertest(app)
                .patch('/api/auth/user')
                .set('Authorization', `Bearer ${token}`)
                .expect(403);
        });

        it('should update own user', async () => {
            const token = generateJwtToken({ id: _doc._id, role: _doc.role });
            const user = new User(_doc.toObject());
            await user.save();
            const findByIdAndUpdateUser = jest.spyOn(User, 'findByIdAndUpdate');
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: 'user', resource: 'user', action: 'update', attributes: ['*', '!role', '!verified', '!disabled', '!email', '!_id'], possession: 'own' }),
            ]);
            const response = await supertest(app).patch('/api/auth/user')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Jane Doe' });
            expect(response.status).toBe(200);
            const updatedUser = await User.findById(_doc._id);
            expect(updatedUser.name).toBe('Jane Doe');
            expect(findByIdAndUpdateUser).toHaveBeenCalledWith(user._id, { name: 'Jane Doe' }, { new: true });
        });

        it('should not update other user if dont have updateAny permission', async () => {
            const token = generateJwtToken({ id: _doc._id, role: _doc.role });
            const user = new User(_doc.toObject());
            await user.save();
            const otherUser = new User({
                name: 'Jane Doe',
                email: 'test1@test.com',
                password: '123',
                role: 'user',
                verified: true,
                disabled: false,
            });
            await otherUser.save();
            const findByIdAndUpdateUser = jest.spyOn(User, 'findByIdAndUpdate');
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: 'user', resource: 'user', action: 'update', attributes: ['*', '!role', '!verified', '!disabled', '!email', '!_id'], possession: 'own' }),
            ]);
            const response = await supertest(app)
                .patch(`/api/auth/user/${otherUser._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Jane Doo' });
            expect(response.status).toBe(200);
            const updatedUser = await User.findById(otherUser._id);
            expect(updatedUser.name).not.toBe('Jane Doo');
            expect(findByIdAndUpdateUser).toHaveBeenCalledWith(user._id, { name: 'Jane Doo' }, { new: true });
        });
        it('should handle error', async () => {
            const token = generateJwtToken({ id: _doc._id, role: _doc.role });
            const user = new User(_doc.toObject());
            await user.save();
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: 'user', resource: 'user', action: 'update', attributes: ['*', '!role', '!verified', '!disabled', '!email', '!_id'], possession: 'own' }),
            ]);
            jest.spyOn(User, 'findByIdAndUpdate').mockRejectedValue(new Error());
            const response = await supertest(app).patch('/api/auth/user')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Jane Doe' });
            expect(response.status).toBe(500);
        });

        it('should return 400 on empty data', async () => {
            const token = generateJwtToken({ id: _doc._id, role: _doc.role });
            const user = new User(_doc.toObject());
            await user.save();
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: 'user', resource: 'user', action: 'update', attributes: ['*', '!role', '!verified', '!disabled', '!email', '!_id'], possession: 'own' }),
            ]);
            const response = await supertest(app).patch('/api/auth/user')
                .set('Authorization', `Bearer ${token}`)
                .send({});
            expect(response.status).toBe(400);
        });

        it('should update other user if have updateAny permission', async () => {
            const token = generateJwtToken({ id: _doc._id, role: _doc.role });
            const user = new User(_doc.toObject());
            await user.save();
            const otherUser = new User({
                name: 'Jane Doe',
                email: 'test1@test.com',
                password: '123',
                role: 'user',
                verified: true,
                disabled: false,
            });
            await otherUser.save();
            const findByIdAndUpdateUser = jest.spyOn(User, 'findByIdAndUpdate');
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: 'user', resource: 'user', action: 'update', attributes: ['*', '!role', '!verified', '!disabled', '!email', '!_id'], possession: 'any' }),
            ]);
            const response = await supertest(app)
                .patch(`/api/auth/user/${otherUser._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Jane Doo' });
            expect(response.status).toBe(200);
            const updatedUser = await User.findById(otherUser._id);
            expect(updatedUser.name).toBe('Jane Doo');
            expect(findByIdAndUpdateUser).toHaveBeenCalledWith(otherUser._id.toString(), { name: 'Jane Doo' }, { new: true });

        });

        it('should not update password if not provided', async () => {
            const token = generateJwtToken({ id: _doc._id, role: _doc.role });
            const user = new User(_doc.toObject());
            await user.save();
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: 'user', resource: 'user', action: 'update', attributes: ['*', '!role', '!verified', '!disabled', '!email', '!_id'], possession: 'own' }),
            ]);
            const response = await supertest(app).patch('/api/auth/user')

                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Jane Doe' });
            expect(response.status).toBe(200);
            const updatedUser = await User.findById(_doc._id);
            expect(updatedUser.name).toBe('Jane Doe');
            expect(updatedUser.password).toBe(user.password);
        });

        it('should update password if current password is provided', async () => {
            const token = generateJwtToken({ id: _doc._id, role: _doc.role });
            const user = new User(_doc.toObject());
            await user.save();
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: 'user', resource: 'user', action: 'update', attributes: ['*', '!role', '!verified', '!disabled', '!email', '!_id'], possession: 'own' }),
            ]);
            const response = await supertest(app).patch('/api/auth/user')
                .set('Authorization', `Bearer ${token}`)
                .send({ password: '123', currentPassword: _doc.password });
            expect(response.status).toBe(200);
            const updatedUser = await User.findById(_doc._id);
            expect(updatedUser.password).not.toBe(user.password);
        });

        it('should return 400 on invalid current password', async () => {
            const token = generateJwtToken({ id: _doc._id, role: _doc.role });
            const user = new User(_doc.toObject());
            await user.save();
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: 'user', resource: 'user', action: 'update', attributes: ['*', '!role', '!verified', '!disabled', '!email', '!_id'], possession: 'own' }),
            ]);
            const response = await supertest(app).patch('/api/auth/user')
                .set('Authorization', `Bearer ${token}`)
                .send({ password: '123', currentPassword: '123' })
                .expect(400);
        });


        it('should encrypt password', async () => {
            const token = generateJwtToken({ id: _doc._id, role: _doc.role });
            const user = new User(_doc.toObject());
            await user.save();
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: 'user', resource: 'user', action: 'update', attributes: ['*', '!role', '!verified', '!disabled', '!email', '!_id'], possession: 'own' }),
            ]);
            const response = await supertest(app).patch('/api/auth/user')
                .set('Authorization', `Bearer ${token}`)
                .send({ password: '123', currentPassword: _doc.password });
            expect(response.status).toBe(200);
            const updatedUser = await User.findById(_doc._id);
            expect(updatedUser).toBeTruthy();
            expect(updatedUser.password).not.toBe('123');
        });

    });

    describe('GET /api/auth/user/:id?', () => {
        it('should not return 404', async () => {
            const response = await supertest(app).get('/api/auth/user');
            expect(response.status).not.toBe(404);
        });

        it('should return 401 on invalid token', async () => {
            const response = await supertest(app).get('/api/auth/user');
            expect(response.status).toBe(401);
        });

        it('should return 403 on invalid user role', async () => {
            const token = generateJwtToken({ _id: _doc._id, role: _doc.role });
            jest.spyOn(User, 'findById').mockResolvedValue(new User(_doc.toObject()));
            jest.spyOn(Grant, 'find').mockResolvedValue([]);
            const response = await supertest(app)
                .get('/api/auth/user')
                .set('Authorization', `Bearer ${token}`)
                .expect(403);
        });

        it('should get own user', async () => {
            const token = generateJwtToken({ id: _doc._id, role: _doc.role });
            const user = new User(_doc.toObject());
            await user.save();
            const findByIdUser = jest.spyOn(User, 'findById').mockResolvedValue(user);
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: 'user', resource: 'user', action: 'read', attributes: ['*'], possession: 'own' }),
            ]);
            const response = await supertest(app).get('/api/auth/user')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({ ...user.toObject(), _id: user._id.toString(), updatedAt: expect.any(String), createdAt: expect.any(String) });
            expect(findByIdUser).toHaveBeenCalledWith(user._id);
        });

        it('should not get other user if dont have readAny permission', async () => {
            const token = generateJwtToken({ id: _doc._id, role: _doc.role });
            const user = new User(_doc.toObject());
            await user.save();
            const otherUser = new User({
                name: 'Jane Doe',
                email: 'test1@test.com',
                password: '123',
                role: 'user',
                verified: true,
                disabled: false,
            });
            await otherUser.save();
            const findByIdUser = jest.spyOn(User, 'findById').mockResolvedValue(user);
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: 'user', resource: 'user', action: 'read', attributes: ['*', '!role', '!verified', '!disabled', '!email', '!_id'], possession: 'own' }),
            ]);
            const response = await supertest(app)
                .get(`/api/auth/user/${otherUser._id}`)
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body).not.toMatchObject(otherUser.toObject());
            expect(findByIdUser).toHaveBeenCalledWith(user._id);
        });

        it('should handle error', async () => {
            const token = generateJwtToken({ id: _doc._id, role: _doc.role });
            const user = new User(_doc.toObject());
            await user.save();
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: 'user', resource: 'user', action: 'read', attributes: ['*', '!role', '!verified', '!disabled', '!email', '!_id'], possession: 'own' }),
            ]);
            jest.spyOn(User, 'findById').mockRejectedValue(new Error());
            const response = await supertest(app).get('/api/auth/user')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(500);
        });

        it('should get other user if have readAny permission', async () => {
            const token = generateJwtToken({ id: _doc._id, role: _doc.role });
            const user = new User(_doc.toObject());
            await user.save();
            const otherUser = new User({
                name: 'Jane Doe',
                email: 'test2@test.com',
                password: '123',
                role: 'user',
                verified: true,
                disabled: false,
            });
            await otherUser.save();
            const findByIdUser = jest.spyOn(User, 'findById');
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: 'user', resource: 'user', action: 'read', attributes: ['*'], possession: 'any' }),
            ]);
            const response = await supertest(app)
                .get(`/api/auth/user/${otherUser._id}`)
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(findByIdUser).toHaveBeenCalledWith(otherUser._id.toString());
        });
    });

});