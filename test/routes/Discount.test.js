const Discount = require('../../app/model/Discount');
const mockingoose = require('mockingoose');
const app = require('../../app');
const User = require('../../app/model/User');
const { generateJwtToken } = require('../../app/utils/jwt');
const { http, server } = require('../fixtures/bettersupertest')(app);
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const { Sequence } = require('../../app/model/Sequence');


afterAll(async () => {
    server.close();
});

describe('Routes: Discount', () => {

    afterEach(() => {
        mockingoose.resetAll();
        jest.restoreAllMocks();
    });

    const admin = new User({ role: 'admin', verified: true, disabled: false });
    const token = admin.generateToken();

    const testUser = new User({ role: 'test', verified: true, disabled: false });
    const testUserToken = testUser.generateToken();

    beforeEach(() => {
        mockingoose(User).toReturn(admin, 'findOne');
    });


    describe('GET /api/discount', () => {
        it('should not return 404', async () => {
            const response = await http.get('/api/discount');
            expect(response.status).not.toBe(404);
        });

        it('should handle forbidden', async () => {
            mockingoose(User).toReturn(testUser, 'findOne');
            const response = await http.get('/api/discount', { headers: { authorization: `Bearer ${testUserToken}` } });
            expect(response.status).toBe(403);
        });

        it('should handle unauthorized', async () => {
            const response = await http.get('/api/discount');
            expect(response.status).toBe(401);
        });

        it('should handle error', async () => {
            mockingoose(Discount).toReturn(new Error(), 'find');
            const response = await http.get('/api/discount', { headers: { authorization: `Bearer ${token}` } });
            expect(response.status).toBe(500);
        });
        it('should return discounts', async () => {
            const discount = {
                _id: '507f191e810c19729de860ea',
                code: 'test',
                type: 'percentage',
                value: 10,
                valid: {
                    from: new Date().toISOString(),
                    to: new Date().toISOString()
                },
                categories: [],
                products: [],
                min: 0,
            };
            mockingoose(Discount).toReturn([discount], 'find');
            const response = await http.get('/api/discount', { headers: { authorization: `Bearer ${token}` } });
            expect(response.status).toBe(200);
            expect(response.data).toEqual([discount]);
        });
    });

    describe('POST /api/discount', () => {
        it('should not return 404', async () => {
            const response = await http.post('/api/discount');
            expect(response.status).not.toBe(404);
        });
        it('should handle forbidden', async () => {
            mockingoose(User).toReturn(testUser, 'findOne');
            const response = await http.post('/api/discount', null, { headers: { authorization: `Bearer ${testUserToken}` } });
            expect(response.status).toBe(403);
        });
        it('should handle unauthorized', async () => {
            const response = await http.post('/api/discount');
            expect(response.status).toBe(401);
        });

        it('should create a discount', async () => {

            const discount = {
                code: 'test',
                type: 'percentage',
                value: 10,
                valid: {
                    from: new Date().toISOString(),
                    to: new Date().toISOString()
                }
            };
            mockingoose(Discount).toReturn(discount, 'save');
            mockingoose(Sequence).toReturn({ seq: 1 }, 'findOneAndUpdate');
            const response = await http.post('/api/discount', discount, { headers: { authorization: `Bearer ${token}` } });
            expect(response.status).toBe(201);
            expect(response.data.createdAt).toBeDefined();
            expect(response.data.updatedAt).toBeDefined();
            expect(response.data._id).toBeDefined();
            expect(response.data.id).toBe(1);
            expect(response.data.code).toBe(discount.code);
            expect(response.data.type).toBe(discount.type);
            expect(response.data.value).toBe(discount.value);
            expect(response.data.valid).toEqual(discount.valid);

        });
        it('should handle error', async () => {

            mockingoose(Discount).toReturn(new Error(), 'save');
            const discount = {
                code: 'test',
                type: 'percentage',
                value: 10,
                valid: {
                    from: new Date().toISOString(),
                    to: new Date().toISOString()
                }
            };
            const response = await http.post('/api/discount', discount, { headers: { authorization: `Bearer ${token}` } });
            expect(response.status).toBe(500);
        });
        it('should handle duplicate discount code', async () => {
            const discount = {
                code: 'test',
                type: 'percentage',
                value: 10,
                valid: {
                    from: new Date().toISOString(),
                    to: new Date().toISOString()
                }
            };
            const error = new mongodb.MongoError('');

            error.code = 11000;
            mockingoose(Sequence).toReturn({ seq: 1 }, 'findOneAndUpdate');
            mockingoose(Discount).toReturn(error, 'save');
            const response = await http.post('/api/discount', discount, { headers: { authorization: `Bearer ${token}` } });
            expect(response.status).toBe(400);
        });
        it('should handle discount request validation', async () => {
            const discount = {
                code: 'test',
                type: 'percentage',
                value: 10,
                valid: {
                    from: new Date().toISOString(),
                    to: new Date().toISOString()
                }
            };
            mockingoose(Sequence).toReturn({ seq: 1 }, 'findOneAndUpdate');
            mockingoose(Discount).toReturn(new mongoose.Error.ValidationError(), 'save');
            const response = await http.post('/api/discount', discount, { headers: { authorization: `Bearer ${token}` } });
            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/discount/validation', () => {
        it('should not return 404', async () => {
            const response = await http.post('/api/discount/validation');
            expect(response.status).not.toBe(404);
        });
        it('should handle forbidden', async () => {
            mockingoose(User).toReturn(testUser, 'findOne');
            const response = await http.post('/api/discount/validation', null, { headers: { authorization: `Bearer ${testUserToken}` } });
            expect(response.status).toBe(403);
        });
        it('should handle unauthorized', async () => {
            const response = await http.post('/api/discount/validation');
            expect(response.status).toBe(401);
        });
        it('should handle error', async () => {
            mockingoose(Discount).toReturn(new Error(), 'findOne');
            const response = await http.post('/api/discount/validation', { code: 'test' }, { headers: { authorization: `Bearer ${token}` } });
            expect(response.status).toBe(500);
        });
        it('should return discount validation', async () => {
            const discount = new Discount({
                _id: '507f191e810c19729de860ea',
                code: 'test',
                type: 'percentage',
                value: 10,
                valid: {
                    from: new Date().toISOString(),
                    to: new Date(new Date().getTime() + 1000 * 60 * 60 * 24).toISOString()
                }
            });
            mockingoose(Discount).toReturn(discount, 'findOne');
            const response = await http.post('/api/discount/validation', { code: 'test' }, { headers: { authorization: `Bearer ${token}` } });
            expect(response.status).toBe(200);
            expect(response.data.valid).toBe(true);
        });
        it('should handle invalid discount on no code ', async () => {
            const discount = new Discount({
                _id: '507f191e810c19729de860ea',
                code: 'test',
                type: 'percentage',
                value: 10,
                valid: {
                    from: new Date().toISOString(),
                    to: new Date().toISOString()
                }
            });
            mockingoose(Discount).toReturn(discount, 'findOne');
            const response = await http.post('/api/discount/validation', null, { headers: { authorization: `Bearer ${token}` } });
            expect(response.status).toBe(200);
            expect(response.data.valid).toBe(false);
        });
        it('should handle invalid discount on  code  not found', async () => {
            mockingoose(Discount).toReturn(null, 'findOne');
            const response = await http.post('/api/discount/validation', { code: 'test' }, { headers: { authorization: `Bearer ${token}` } });
            expect(response.status).toBe(200);
            expect(response.data.valid).toBe(false);
        });
    });

    describe('DELETE /api/discount/:id', () => {
        it('should not return 404', async () => {
            mockingoose(Discount).toReturn({ _id: '507f191e810c19729de860ea' }, 'findOneAndDelete');
            const response = await http.delete('/api/discount/507f191e810c19729de860ea');
            expect(response.status).not.toBe(404);
        });
        it('should handle forbidden', async () => {
            mockingoose(User).toReturn(testUser, 'findOne');
            const response = await http.delete('/api/discount/507f191e810c19729de860ea', { headers: { authorization: `Bearer ${testUserToken}` } });
            expect(response.status).toBe(403);
        });
        it('should handle unauthorized', async () => {
            const response = await http.delete('/api/discount/507f191e810c19729de860ea');
            expect(response.status).toBe(401);
        });
        it('should handle error', async () => {

            mockingoose(Discount).toReturn(new Error(), 'findOneAndDelete');
            const response = await http.delete('/api/discount/507f191e810c19729de860ea', { headers: { authorization: `Bearer ${token}` } });
            expect(response.status).toBe(500);
        });
        it('should delete a discount', async () => {
            const discount = new Discount({
                _id: '507f191e810c19729de860ea',
                code: 'test',
                type: 'percentage',
                value: 10,
                valid: {
                    from: new Date().toISOString(),
                    to: new Date().toISOString()
                }
            });
            mockingoose(Discount).toReturn(discount, 'findOneAndDelete');
            const response = await http.delete('/api/discount/507f191e810c19729de860ea', { headers: { authorization: `Bearer ${token}` } });
            expect(response.status).toBe(200);
        });
        it('should handle not found', async () => {
            mockingoose(Discount).toReturn(null, 'findOneAndDelete');
            const response = await http.delete('/api/discount/507f191e810c19729de860ea', { headers: { authorization: `Bearer ${token}` } });
            expect(response.status).toBe(404);
        });
    });
});

