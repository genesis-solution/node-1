const Order = require('../../app/model/Order');
const app = require('../../app');
const User = require('../../app/model/User');
const Cancelation = require('../../app/model/Cancelation');
const { Grant } = require('../../app/model/Grant');
const { server, http } = require('../fixtures/bettersupertest')(app);

describe('Routes - Cancelation', () => {
    afterAll(() => {
        server.close();
    });
    afterEach(async () => {
        jest.restoreAllMocks();
    });


    const user = new User({ verified: true, disabled: false, role: 'user' });
    const admin = new User({ verified: true, disabled: false, role: 'admin' });

    //POST /api/cancelation
    describe('POST /api/cancelations', () => {
        beforeEach(() => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "user", resource: "cancelation", action: "create", attributes: ["order"], possession: "any" }),
                new Grant({ role: "user", resource: "cancelation", action: "read", attributes: ["order"], possession: "own" }),
            ]);
        });
        it('should not return 404', async () => {
            const res = await http.post('/api/cancelation');
            expect(res.status).not.toBe(404);
        });
        it('should handle errors', async () => {

            const token = user.generateToken();

            jest.spyOn(User, 'findOne').mockResolvedValue(user);
            jest.spyOn(Order, 'findOne').mockRejectedValue(new Error());

            const res = await http.post('/api/cancelation', { order: '5f3e3b2b7b3e7a2a58f2ca66' }, { headers: { 'authorization': `Bearer ${token}` } });
            expect(res.status).toBe(500);
        });
        it('should return unauthorized', async () => {
            const res = await http.post('/api/cancelation');
            expect(res.status).toBe(401);
        });
    });
    //POST /api/cancelation/approve/:id
    describe('POST /api/cancelation/approve/:id', () => {
        beforeEach(() => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "admin", resource: "cancelation", action: "create", attributes: ["order"], possession: "any" }),
                new Grant({ role: "admin", resource: "cancelation", action: "read", attributes: ["order"], possession: "any" }),
                new Grant({ role: "admin", resource: "cancelation", action: "delete", attributes: ["order"], possession: "any" }),
                new Grant({ role: "admin", resource: "cancelation", action: "update", attributes: ["order"], possession: "any" }),

            ]);
        });
        it('should not return 404', async () => {
            const res = await http.post('/api/cancelation/approve/5f3e3b2b7b3e7a2a58f2ca66');
            expect(res.status).not.toBe(404);
        });
        it('should handle errors', async () => {
            const token = admin.generateToken();
            // mockingoose(User).toReturn(admin, 'findOne');
            jest.spyOn(User, 'findById').mockResolvedValue(admin);
            // mockingoose(Cancelation).toReturn(new Error(), 'findOne');
            jest.spyOn(Cancelation, 'findById').mockResolvedValue(new Error());
            const res = await http.post('/api/cancelation/approve/5f3e3b2b7b3e7a2a58f2ca66', {policy: 'Full refund'}, { headers: { 'authorization': `Bearer ${token}` } });
            expect(res.status).toBe(500);
        });
        it('should return unauthorized', async () => {
            const res = await http.post('/api/cancelation/approve/5f3e3b2b7b3e7a2a58f2ca66');
            expect(res.status).toBe(401);
        });
        it('should return forbidden', async () => {
            // mockingoose(Grant).toReturn([], 'find');
            jest.spyOn(Grant, 'find').mockResolvedValue([]);
            const token = user.generateToken();
            // mockingoose(User).toReturn(user, 'findOne');
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const res = await http.post('/api/cancelation/approve/5f3e3b2b7b3e7a2a58f2ca66', {}, { headers: { 'authorization': `Bearer ${token}` } });
            expect(res.status).toBe(403);
        });
    });

    //POST /api/cancelation/reject/:id
    describe('POST /api/cancelation/reject/:id', () => {
        beforeEach(() => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "admin", resource: "cancelation", action: "create", attributes: ["order"], possession: "any" }),
                new Grant({ role: "admin", resource: "cancelation", action: "read", attributes: ["order"], possession: "any" }),
                new Grant({ role: "admin", resource: "cancelation", action: "delete", attributes: ["order"], possession: "any" }),
                new Grant({ role: "admin", resource: "cancelation", action: "update", attributes: ["order"], possession: "any" }),

            ]);
        });

        it('should not return 404', async () => {
            const res = await http.post('/api/cancelation/reject/5f3e3b2b7b3e7a2a58f2ca66');
            expect(res.status).not.toBe(404);
        });
        it('should handle errors', async () => {
            const token = admin.generateToken();
            // mockingoose(User).toReturn(admin, 'findOne');
            jest.spyOn(User, 'findById').mockResolvedValue(admin);
            // mockingoose(Cancelation).toReturn(new Error(), 'findOne');
            jest.spyOn(Cancelation, 'findById').mockResolvedValue(new Error());
            const res = await http.post('/api/cancelation/reject/5f3e3b2b7b3e7a2a58f2ca66', {}, { headers: { 'authorization': `Bearer ${token}` } });
            expect(res.status).toBe(500);
        });
        it('should return unauthorized', async () => {
            const res = await http.post('/api/cancelation/reject/5f3e3b2b7b3e7a2a58f2ca66');
            expect(res.status).toBe(401);
        });
        it('should return forbidden', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([]);
            const token = user.generateToken();
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const res = await http.post('/api/cancelation/reject/5f3e3b2b7b3e7a2a58f2ca66', {}, { headers: { 'authorization': `Bearer ${token}` } });
            expect(res.status).toBe(403);
        });
    });

    //GET /api/cancelation
    describe('GET /api/cancelation', () => {
        beforeEach(() => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "user", resource: "cancelation", action: "create", attributes: ["order"], possession: "any" }),
                new Grant({ role: "user", resource: "cancelation", action: "read", attributes: ["order"], possession: "own" }),
            ]);
        });
        it('should not return 404', async () => {
            const res = await http.get('/api/cancelation');
            expect(res.status).not.toBe(404);
        });
        it('should handle errors', async () => {
            const token = user.generateToken();
            // mockingoose(User).toReturn(user, 'findOne');
            jest.spyOn(User, 'findOne').mockResolvedValue(user);
            // mockingoose(Cancelation).toReturn(new Error(), 'find');
            jest.spyOn(Cancelation, 'countDocuments').mockRejectedValue(new Error());
            const res = await http.get('/api/cancelation', { headers: { 'authorization': `Bearer ${token}` } });
            expect(res.status).toBe(500);
        });
        it('should return unauthorized', async () => {
            const res = await http.get('/api/cancelation');
            expect(res.status).toBe(401);
        });

    });

});