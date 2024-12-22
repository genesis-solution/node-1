const app = require('../../app');
const request = require('supertest');
const mongoose = require('mongoose');
const ChargeRate = require('../../app/model/ChargeRate');
const { connect } = require('../../app/config/database');
const User = require('../../app/model/User');
const { Grant } = require('../../app/model/Grant');


describe('Routes: ChargeRate', () => {
    let connection;
    beforeAll(async () => {
        connection = await connect('test-chargeRate');
        await Grant.create([
            new Grant({
                role: 'admin',
                resource: 'chargeRate',
                action: 'create',
                attributes: ['*'],
                possession: 'any'

            }),
            new Grant({ role: 'admin', resource: 'chargeRate', action: 'read', attributes: ['*'], possession: 'any' }),
            new Grant({ role: 'admin', resource: 'chargeRate', action: 'update', attributes: ['*'], possession: 'any' }),
            new Grant({ role: 'admin', resource: 'chargeRate', action: 'delete', attributes: ['*'], possession: 'any' }),
        ]);
    });
    afterAll(async () => {
        await ChargeRate.deleteMany();
        await connection.disconnect();
    });

    afterEach(async () => {
        await ChargeRate.deleteMany();
        jest.restoreAllMocks();
    });
    const admin = new User({
        disabled: false, verified: true, role: 'admin'
    });
    const user = new User({
        disabled: false, verified: true, role: 'user'
    });
    describe('PATCH /api/chargeRate', () => {
        it('should not return 404', async () => {
            const response = await request(app)
                .patch('/api/chargeRate');
            expect(response.status).not.toBe(404);
        });

        it('should handle authorization', async () => {
            const response = await request(app)
                .patch('/api/chargeRate');
            expect(response.status).toBe(401);
        });

        it('should return 403 if user does not permission', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([]);
            jest.spyOn(User, 'findOne').mockResolvedValue(user);
            const response = await request(app)
                .patch('/api/chargeRate')
                .set('Authorization', `Bearer ${user.generateToken()}`);
            expect(response.status).toBe(403);
        });

        it('should create a new tax rate', async () => {
            jest.spyOn(User, 'findOne').mockResolvedValue(admin);
            const response = await request(app)
                .patch('/api/chargeRate')
                .set('Authorization', `Bearer ${admin.generateToken()}`)
                .send({
                    country: 'USA',
                    state: 'Connecticut',
                    city: 'Hartford',
                    taxRate: 6.35,
                    serviceFee: 0.5
                });
            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                country: 'USA',
                state: 'Connecticut',
                city: 'Hartford',
                taxRate: 6.35,
                serviceFee: 0.5
            });
        });

        it('should update an existing tax rate', async () => {
            jest.spyOn(User, 'findOne').mockResolvedValue(admin);
            await ChargeRate.create({
                country: 'USA',
                state: 'Connecticut',
                city: 'Hartford',
                taxRate: 6.35,
                serviceFee: 0.5

            });
            const response = await request(app)
                .patch('/api/chargeRate')
                .set('Authorization', `Bearer ${admin.generateToken()}`)
                .send({
                    country: 'USA',
                    state: 'Connecticut',
                    city: 'Hartford',
                    taxRate: 6.35,
                    serviceFee: 0.57
                });
            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                country: 'USA',
                state: 'Connecticut',
                city: 'Hartford',
                taxRate: 6.35,
                serviceFee: 0.57
            });
        });



        it('should handle validation', async () => {
            jest.spyOn(User, 'findOne').mockResolvedValue(admin);
            const response = await request(app)
                .patch('/api/chargeRate')
                .set('Authorization', `Bearer ${admin.generateToken()}`)
                .send({
                    country: 'USA',
                    state: 'Connecticut',
                    taxRate: 6.35,
                });
            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
                errors: expect.any(Array)
            });
        });
        it('should handle errors 500', async () => {
            jest.spyOn(User, 'findOne').mockResolvedValue(admin);
            jest.spyOn(ChargeRate, 'findOneAndUpdate').mockRejectedValue(new Error('error'));
            const response = await request(app)
                .patch('/api/chargeRate')
                .set('Authorization', `Bearer ${admin.generateToken()}`)
                .send({
                    country: 'USA',
                    state: 'Connecticut',
                    city: 'Hartford',
                    taxRate: 6.35,
                    serviceFee: 0.5
                });
            expect(response.status).toBe(500);
            expect(response.body).toMatchObject({
                message: 'error'
            });
        });
    });

    describe('GET /api/chargeRate', () => {
        it('should not return 404', async () => {
            const response = await request(app)
                .get('/api/chargeRate');
            expect(response.status).not.toBe(404);
        });

        it('should handle authorization', async () => {
            const response = await request(app)
                .get('/api/chargeRate');
            expect(response.status).toBe(401);
        });

        it('should return 403 if user does not permission', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([]);
            jest.spyOn(User, 'findOne').mockResolvedValue(user);
            const response = await request(app)
                .get('/api/chargeRate')
                .set('Authorization', `Bearer ${user.generateToken()}`);
            expect(response.status).toBe(403);
        });

        it('should return all tax rates', async () => {
            jest.spyOn(User, 'findOne').mockResolvedValue(admin);
            await ChargeRate.create({
                country: 'USA',
                state: 'Connecticut',
                city: 'Hartford',
                taxRate: 6.35,
                serviceFee: 0.5
            });
            const response = await request(app)
                .get('/api/chargeRate')
                .set('Authorization', `Bearer ${admin.generateToken()}`);
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject([
                {
                    country: 'USA',
                    state: 'Connecticut',
                    city: 'Hartford',
                    taxRate: 6.35,
                    serviceFee: 0.5
                }
            ]);
        });

        it('should handle errors 500', async () => {
            jest.spyOn(User, 'findOne').mockResolvedValue(admin);
            jest.spyOn(ChargeRate, 'find').mockRejectedValue(new Error('error'));
            const response = await request(app)
                .get('/api/chargeRate')
                .set('Authorization', `Bearer ${admin.generateToken()}`);
            expect(response.status).toBe(500);
        });
    });

    describe('GET /api/chargeRate/cities', () => {
        beforeEach(() => {
            jest.spyOn(Grant, 'find').mockResolvedValue([new Grant(
                {
                    role: 'anonymous',
                    resource: 'chargeRate',
                    action: 'read',
                    attributes: ['*'],
                    possession: 'any'
                }
            )]);

        });
        it('should not return 404', async () => {
            const response = await request(app)
                .get('/api/chargeRate/cities');
            expect(response.status).not.toBe(404);
        });


        it('should return 403 if user does not permission', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([]);
            jest.spyOn(User, 'findOne').mockResolvedValue(user);
            const response = await request(app)
                .get('/api/chargeRate/cities')
                .set('Authorization', `Bearer ${user.generateToken()}`);
            expect(response.status).toBe(403);
        });

        it('should return all cities', async () => {
            jest.spyOn(User, 'findOne').mockResolvedValue(admin);
            await ChargeRate.create({
                country: 'USA',
                state: 'Connecticut',
                city: 'Hartford',
                taxRate: 6.35,
                serviceFee: 0.5
            });
            const response = await request(app)
                .get('/api/chargeRate/cities')
                .set('Authorization', `Bearer ${admin.generateToken()}`)
                .query({ country: 'USA', state: 'Connecticut' });
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject(['Hartford']);
        });

        it('should handle errors 500', async () => {
            jest.spyOn(User, 'findOne').mockResolvedValue(admin);
            jest.spyOn(mongoose.Query.prototype, 'distinct').mockRejectedValue(new Error('error'));
            const response = await request(app)
                .get('/api/chargeRate/cities')
                .set('Authorization', `Bearer ${admin.generateToken()}`)
                .query({ country: 'USA', state: 'Connecticut' });
            expect(response.status).toBe(500);
        });
    });
    describe('GET /api/chargeRate/states', () => {
        it('should not return 404', async () => {
            const response = await request(app)
                .get('/api/chargeRate/states');
            expect(response.status).not.toBe(404);
        });


        it('should return 403 if user does not permission', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([]);
            jest.spyOn(User, 'findOne').mockResolvedValue(user);
            const response = await request(app)
                .get('/api/chargeRate/states')
                .set('Authorization', `Bearer ${user.generateToken()}`);
            expect(response.status).toBe(403);
        });

        it('should return all states', async () => {
            jest.spyOn(User, 'findOne').mockResolvedValue(admin);
            await ChargeRate.create({
                country: 'USA',
                state: 'Connecticut',
                city: 'Hartford',
                taxRate: 6.35,
                serviceFee: 0.5
            });
            const response = await request(app)
                .get('/api/chargeRate/states')
                .set('Authorization', `Bearer ${admin.generateToken()}`)
                .query({ country: 'USA' });
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject(['Connecticut']);
        });

        it('should handle errors 500', async () => {
            jest.spyOn(User, 'findOne').mockResolvedValue(admin);
            jest.spyOn(mongoose.Query.prototype, 'distinct').mockRejectedValue(new Error('error'));
            const response = await request(app)
                .get('/api/chargeRate/states')
                .set('Authorization', `Bearer ${admin.generateToken()}`)
                .query({ country: 'USA' });
            expect(response.status).toBe(500);
        });
    });


});


