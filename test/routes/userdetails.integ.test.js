const app = require("../../app");
const { connect } = require("../../app/config/database");
const { Grant } = require("../../app/model/Grant");
const User = require("../../app/model/User");
const request = require('supertest');
const UserDetails = require("../../app/model/UserDetails");

describe('Routes: userdetails', () => {
    let connection;
    const admin = new User({ verified: true, disabled: false, role: 'admin', });
    const user = new User({ verified: true, disabled: false, role: 'user', });
    const user2 = new User({ verified: true, disabled: false, role: 'user', });

    const adminToken = admin.generateToken();
    const userToken = user.generateToken();

    beforeAll(async () => {
        connection = await connect('test-route-userdetails');

        await Grant.create([
            new Grant({ role: 'user', resource: 'userDetails', possession: 'own', action: 'create', attributes: ['*'] }),
            new Grant({ role: 'user', resource: 'userDetails', possession: 'own', action: 'read', attributes: ['*'] }),
            new Grant({ role: 'user', resource: 'userDetails', possession: 'own', action: 'delete', attributes: ['*'] }),
            new Grant({ role: 'user', resource: 'userDetails', possession: 'own', action: 'update', attributes: ['*'] }),

            new Grant({ role: 'admin', resource: 'userDetails', possession: 'any', action: 'create', attributes: ['*'] }),
            new Grant({ role: 'admin', resource: 'userDetails', possession: 'any', action: 'read', attributes: ['*'] }),
            new Grant({ role: 'admin', resource: 'userDetails', possession: 'any', action: 'delete', attributes: ['*'] }),
            new Grant({ role: 'admin', resource: 'userDetails', possession: 'any', action: 'update', attributes: ['*'] }),
        ]);
    });
    beforeEach(async () => {

    });
    afterEach(async () => {
        jest.restoreAllMocks();
        await UserDetails.deleteMany();
        await User.deleteMany();
    });

    afterAll(async () => {
        await Grant.deleteMany();
        await connection.disconnect();
    });

    const _doc = {
        salutation: 'test',
        lastName: 'test',
        phone: 1234567890,
        firstName: 'testuser',
        address: 'test',
        city: 'test',
        state: 'test',
        country: 'test',
        zip: 1234,
        document: 'test',
    };


    describe('GET /api/userdetails/:id?', () => {
        beforeEach(async () => {
            await UserDetails.create({
                user: user._id,
                ..._doc
            });
        });
        it('should not return 404', async () => {
            const response = await request(app).get('/api/userdetails');
            expect(response.status).not.toBe(404);
        });

        it('should handle Unauthorized', async () => {
            const response = await request(app).get('/api/userdetails');
            expect(response.unauthorized).toBeTruthy();
        });

        it('should return own userDetails', async () => {
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const response = await request(app).get('/api/userdetails')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);
            expect(response.body.firstName).toBe('testuser');
            expect(response.body.user).toBe(user._id.toString());
        });
        it('should handle errors', async () => {
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const findOneUserDetails = jest.spyOn(UserDetails, 'findOne').mockRejectedValue(new Error('error'));
            await request(app).get('/api/userdetails')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(500);
            expect(findOneUserDetails).toHaveBeenCalled();
        });

        it('should return 403 forbidden on if user have readOwn and tries to read other user\'s details', async () => {
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const response = await request(app).get(`/api/userdetails/${user2._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);
        });

        it('should return 200 OK on if user have readAny and tries to read other user\'s details', async () => {
            const userDetails = await UserDetails.create({..._doc, firstName: 'testuser', user: user2._id });
            jest.spyOn(User, 'findById').mockResolvedValue(admin);
            const response = await request(app).get(`/api/userdetails/${user2._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
        });
    });

    describe('PATCH /api/userdetails/:id?', () => {

        it('should not return 404', async () => {
            const response = await request(app).patch('/api/userdetails');
            expect(response.status).not.toBe(404);
        });

        it('should handle Unauthorized', async () => {
            const response = await request(app).patch('/api/userdetails');
            expect(response.unauthorized).toBeTruthy();
        });

        it('should update own userDetails', async () => {
            await UserDetails.create({
                user: user._id,
                ..._doc
            });
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const response = await request(app).patch('/api/userdetails')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ firstName: 'testuser2' })
                .expect(200);
            expect(response.body.firstName).toBe('testuser2');
            expect(response.body.user).toBe(user._id.toString());
        });
        it('should handle errors', async () => {
            await UserDetails.create({
                user: user._id,
                ..._doc

            });
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const findOneAndUpdate = jest.spyOn(UserDetails, 'findOneAndUpdate').mockRejectedValue(new Error('error'));
            const response = await request(app).patch('/api/userdetails')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ firstName: 'testuser2' })
                .expect(500);
            expect(findOneAndUpdate).toHaveBeenCalled();
        });

        it('should not update user field', async () => {
            await UserDetails.create({
                user: user._id,
                ..._doc

            });
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const response = await request(app).patch('/api/userdetails')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ user: user2._id })
                .expect(200);
            expect(response.body.user).toBe(user._id.toString());
        });

        it('should create new userDetails if not exists', async () => {
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const response = await request(app).patch('/api/userdetails')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ firstName: 'testuser2' })
                .expect(200);
            expect(response.body.firstName).toBe('testuser2');
            expect(response.body.user).toBe(user._id.toString());
        });

        it('should update User.name on update userDetails', async () => {
            const user = await User.create({ name: 'test', email: 'test@test.com', password: 'test', verified: true, disabled: false });
            const userToken = user.generateToken();
            const firstName = 'test';
            const lastName = 'user2';
            await UserDetails.create({
                user: user._id,
                ..._doc

            });
            const findById = jest.spyOn(User, 'findById').mockResolvedValue(user);
            const updateOne = jest.spyOn(User, 'updateOne');

            const response = await request(app).patch('/api/userdetails')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ firstName, lastName })
                .expect(200);

            findById.mockRestore();
            expect(response.body.firstName).toBe('test');
            expect(response.body.user).toBe(user._id.toString());


            expect(updateOne).toHaveBeenCalledWith({ _id: user._id }, { name: `${firstName} ${lastName}` });
            const updatedUser = await User.findById(user._id);
            expect(updatedUser.name).toBe(`${firstName} ${lastName}`);
            updateOne.mockRestore();
        });

        it('should return 403 forbidden on if user have updateOwn and tries to update other user\'s details', async () => {
            await UserDetails.create({
                user: user2._id,
                ..._doc
            });
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const response = await request(app).patch(`/api/userdetails/${user2._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ firstName: 'testuser2' })
                .expect(403);
        });

        it('should return 200 OK on if user have updateAny and tries to update other user\'s details', async () => {
            await UserDetails.create({
                user: user2._id,
                ..._doc
            });
            jest.spyOn(User, 'findById').mockResolvedValue(admin);
            const response = await request(app).patch(`/api/userdetails/${user2._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ firstName: 'testuser2' })
                .expect(200);
        });
    });

    describe('GET /api/userdetails/all', () => {
        it('should not return 404', async () => {
            const response = await request(app).get('/api/userdetails/all');
            expect(response.status).not.toBe(404);
        });

        it('should handle Unauthorized', async () => {
            const response = await request(app).get('/api/userdetails/all');
            expect(response.unauthorized).toBeTruthy();
        });

        it('should return all userDetails with paginate', async () => {
            await UserDetails.create({ firstName: 'testuser', user: user._id, ..._doc });
            await UserDetails.create({ firstName: 'testuser2', user: user2._id, ..._doc });
            jest.spyOn(User, 'findById').mockResolvedValue(admin);
            const response = await request(app).get('/api/userdetails/all?page=1')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            expect(response.body.data.length).toBe(2);
        });

        it('should handle error', async () => {
            await UserDetails.create({ firstName: 'testuser', user: user._id, ..._doc });
            await UserDetails.create({ firstName: 'testuser2', user: user2._id, ..._doc });
            const countDocuments = jest.spyOn(UserDetails, 'countDocuments').mockRejectedValue(new Error('error'));
            jest.spyOn(User, 'findById').mockResolvedValue(admin);
            const response = await request(app).get('/api/userdetails/all?page=1')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(500);
            expect(countDocuments).toHaveBeenCalled();
        });

        it('should return all userDetails with filter', async () => {
            await UserDetails.create({..._doc,  firstName: 'testuser', user: user._id, });
            await UserDetails.create({..._doc, firstName: 'testuser2', user: user2._id,  });
            jest.spyOn(User, 'findById').mockResolvedValue(admin);
            const response = await request(app).get('/api/userdetails/all?firstName=testuser')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            expect(response.body.data.length).toBe(1);
        });
    });




});