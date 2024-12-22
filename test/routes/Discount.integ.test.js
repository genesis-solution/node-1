const app = require('../../app');
const Discount = require('../../app/model/Discount');
const database = require('../../app/config/database');
const User = require('../../app/model/User');
const { http, server } = require('../fixtures/bettersupertest')(app);

afterAll(async () => {
    server.close();
});

describe('Routes: Discount', () => {
    let connection;
    beforeAll(async () => {
        connection = await database.connect();
    });
    afterAll(async () => {
        await Discount.deleteMany({});
        await User.deleteMany({});
        await connection.disconnect();
    });

    afterEach(async () => {
        await Discount.deleteMany({});
        await User.deleteMany({});
    });
    let user;
    beforeEach(async () => {
        user = await User.create({ password: 'test', email: 'test@test.com', role: 'admin', name: 'test', verified: true, disabled: false });
    });

    describe('GET /api/discount', () => {
        it('should not return 404', async () => {
            const response = await http.get('/api/discount');
            expect(response.status).not.toBe(404);
        });
        it('should return discounts', async () => {
            const token = user.generateToken();
            await Discount.create({ code: 'test', type: 'percentage', value: 10, valid: { from: new Date(), to: new Date() } });

            const response = await http.get('/api/discount', { headers: { authorization: `Bearer ${token}` } });
            expect(response.status).toBe(200);
            expect(response.data.length).toBe(1);
            expect(response.data[0].code).toBe('test');
        });
    });
    describe('POST /api/discount', () => {
        

        it('should not return 404', async () => {
            const response = await http.post('/api/discount');
            expect(response.status).not.toBe(404);
        });
        it('should create discount', async () => {
            const token = user.generateToken();
            const response = await http.post('/api/discount', { code: 'test', type: 'percentage', value: 10, valid: { from: new Date(), to: new Date() } }, { headers: { authorization: `Bearer ${token}` } });
            expect(response.status).toBe(201);
            expect(response.data.code).toBe('test');
        });
        it('should handle duplicate code', async () => {
            const token = user.generateToken();
            await Discount.create({ code: 'test', type: 'percentage', value: 10, valid: { from: new Date(), to: new Date() } });
            const response = await http.post('/api/discount', { code: 'test', type: 'percentage', value: 10, valid: { from: new Date(), to: new Date() } }, { headers: { authorization: `Bearer ${token}` } });
            expect(response.status).toBe(400);
        });
        it('should handle validation error', async () => {
            const token = user.generateToken();
            const response = await http.post('/api/discount', { code: 'test', type: 'percentage', value: 'test', valid: { from: new Date(), to: new Date() } }, { headers: { authorization: `Bearer ${token}` } });
            expect(response.status).toBe(400);
        });
    });
});