const app = require('../../app');
const Cancelation = require('../../app/model/Cancelation');
const User = require('../../app/model/User');
const Order = require('../../app/model/Order');
const Refund = require('../../app/model/Refund');
const { connect } = require('../../app/config/database');
const Product = require('../../app/model/Product');
const Category = require('../../app/model/Category');
const { Grant, resources } = require('../../app/model/Grant');
const { http, server } = require('../fixtures/bettersupertest')(app);

describe('Routes: Cancelation', () => {
    let connection;
    afterAll(async () => {
        server.close();
        await connection.disconnect();
    });
    beforeAll(async () => {
        connection = await connect('test-can-route');
        await Grant.insertMany([
            {
                action: 'create',
                resource: resources.cancelation,
                possession: 'own',
                role: 'user',
                attributes: ['*'],
            },
            {
                action: 'create',
                resource: resources.cancelation,
                possession: 'any',
                role: 'admin',
                attributes: ['*'],
            },
            {
                action: 'update',
                resource: resources.cancelation,
                possession: 'any',
                role: 'admin',
                attributes: ['*'],
            },
            {
                action: 'read',
                resource: resources.cancelation,
                possession: 'own',
                role: 'user',
                attributes: ['*'],
            },
            {
                action: 'read',
                resource: resources.cancelation,
                possession: 'any',
                role: 'admin',
                attributes: ['*'],
            },
        ]);
    });

    afterEach(async () => {
        await Promise.all([
            Cancelation.deleteMany({}),
            Refund.deleteMany({}),
            Order.deleteMany({}),
            Product.deleteMany({}),
            User.deleteMany({}),
            Category.deleteMany({}),
        ]);
    });
    beforeEach(async () => {
        const order = await require('../fixtures/prepareOrder')();
        order.status = 'confirmed';
        await order.save();
    });
    describe('POST /api/cancelation', () => {

        it('should create a cancelation', async () => {
            const order = await Order.findOne({});
            const user = await User.findOne({});
            const token = user.generateToken();
            const reasons = [
                'Out of stock',
                'Order by mistake',
                'Price is high',
                'Wrong Address',
                'Other',
            ];
            const reason = reasons[Math.floor(Math.random() * reasons.length)];
            const note = 'note';
            const data = {
                reason,
                note,
                order: order._id,
            };
            const res = await http.post('/api/cancelation', data, { headers: { 'authorization': `Bearer ${token}` } });
            expect(res.status).toBe(201);
            expect(res.data._id).toBeDefined();
            expect(res.data.reason).toBe(reason);
            expect(res.data.note).toBe(note);
            expect(res.data.order).toBe(order._id.toString());
            expect(res.data.approved).toBe(false);
            const found = await Cancelation.findById(res.data._id);
            expect(found._id.toString()).toEqual(res.data._id.toString());
            expect(found.user).toEqual(user._id);
            expect(found.reason).toEqual(reason);
            expect(found.order).toEqual(order._id);
            expect(found.approved).toEqual(false);
            expect(found.note).toEqual(note);
            expect(found.id).toBeDefined();
            expect(found.createdAt).toBeDefined();
            expect(found.updatedAt).toBeDefined();
        });
        it('should return 404 if user cancel other user order', async () => {
            const order = await Order.findOne({});
            const user = await User.findOne({});
            const anotherUser = new User({
                name: 'another user',
                email: 'test@test1.com',
                password: 'password',
                verified: true,
                disabled: false,
            });
            await anotherUser.save();
            const token = anotherUser.generateToken();
            const reasons = [
                'Out of stock',
                'Order by mistake',
                'Price is high',
                'Wrong Address',
                'Other',
            ];
            const reason = reasons[Math.floor(Math.random() * reasons.length)];
            const note = 'note';
            const data = {
                reason,
                note,
                order: order._id,
            };
            const res = await http.post('/api/cancelation', data, { headers: { 'authorization': `Bearer ${token}` } });
            expect(res.status).toBe(404);
        });
        it('should return conflict if cancelation already exists', async () => {
            const order = await Order.findOne({});
            const user = await User.findOne({});
            const token = user.generateToken();
            const reasons = [
                'Out of stock',
                'Order by mistake',
                'Price is high',
                'Wrong Address',
                'Other',
            ];
            const reason = reasons[Math.floor(Math.random() * reasons.length)];
            const note = 'note';
            const data = {
                reason,
                note,
                order: order._id,
            };
            await http.post('/api/cancelation', data, { headers: { 'authorization': `Bearer ${token}` } });
            const res = await http.post('/api/cancelation', data, { headers: { 'authorization': `Bearer ${token}` } });
            expect(res.status).toBe(409);
        });
        it('should not return forbidden if user is admin', async () => {
            const order = await Order.findOne({});
            const admin = new User({
                name: 'admin',
                email: 'test@admin.com',
                password: 'password',
                role: 'admin',
                disabled: false,
                verified: true,
            });
            await admin.save();
            const token = admin.generateToken();
            const reasons = [
                'Out of stock',
                'Order by mistake',
                'Price is high',
                'Wrong Address',
                'Other',
            ];
            const reason = reasons[Math.floor(Math.random() * reasons.length)];
            const note = 'note';
            const data = {
                reason,
                note,
                order: order._id,
            };
            const res = await http.post('/api/cancelation', data, { headers: { 'authorization': `Bearer ${token}` } });
            expect(res.status).toBe(201);
        });

        it('should return 404 if order not found', async () => {
            const user = await User.findOne({});
            const token = user.generateToken();
            const res = await http.post('/api/cancelation', { order: '5f3e3b2b7b3e7a2a58f2ca66' }, { headers: { 'authorization': `Bearer ${token}` } });
            expect(res.status).toBe(404);
        });

        it('should return 400 on validation error', async () => {
            const user = await User.findOne({});
            const token = user.generateToken();
            const order = await Order.findOne({});
            const res = await http.post('/api/cancelation', {
                reason: 'Invalid reason',
                note: '',
                order: order._id,
            }, { headers: { 'authorization': `Bearer ${token}` } });
            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/cancelation/approve/:id', () => {
        it('should approve a cancelation with full refund', async () => {

            const order = await Order.findOne({});
            const user = await User.findOne({});
            user.role = 'admin';
            await user.save();
            const token = user.generateToken();
            const cancelation = new Cancelation({
                user,
                note: 'note',
                order,
                approved: false,
            });
            await cancelation.save();
            const res = await http.post(
                `/api/cancelation/approve/${cancelation._id}`,
                { policy: 'Full refund' },
                { headers: { 'authorization': `Bearer ${token}` } }
            )
                ;
            // console.log(res.data);
            expect(res.status).toBe(200);
            const found = await Cancelation.findById(cancelation._id).populate('refund');
            expect(found.approved).toBe(true);
            expect(found.refund).toBeDefined();
            expect(found.refund.amount).toBe(order.amount);
        });
        it('should approve a cancelation with Partial refund', async () => {

            const order = await Order.findOne({});
            const user = await User.findOne({});
            user.role = 'admin';
            await user.save();
            const token = user.generateToken();
            const cancelation = new Cancelation({
                user,
                note: 'note',
                order,
                approved: false,
            });
            await cancelation.save();
            const res = await http.post(
                `/api/cancelation/approve/${cancelation._id}`,
                { policy: 'Partial refund' },
                { headers: { 'authorization': `Bearer ${token}` } }
            )
                ;
            // console.log(res.data);
            expect(res.status).toBe(200);
            const found = await Cancelation.findById(cancelation._id).populate('refund');
            expect(found.approved).toBe(true);
            expect(found.refund).toBeDefined();
            const duration = Math.ceil((order.rent.end.getTime() - order.rent.start.getTime()) / 3.6e6);
            const amount = order.products.reduce((acc, p) => acc + p.amount * duration, 0);
            expect(found.refund.amount).toBe(amount / 2);
        });
        it('should reject a cancellation with No Refund', async () => {

            const order = await Order.findOne({});
            const user = await User.findOne({});
            user.role = 'admin';
            await user.save();
            const token = user.generateToken();
            const cancelation = new Cancelation({
                user,
                note: 'note',
                order,
                approved: false,
            });
            await cancelation.save();
            const res = await http.post(
                `/api/cancelation/approve/${cancelation._id}`,
                { policy: 'No refund' },
                { headers: { 'authorization': `Bearer ${token}` } }
            )
                ;
            // console.log(res.data);
            expect(res.status).toBe(200);
            const found = await Cancelation.findById(cancelation._id).populate('refund');
            expect(found.approved).toBe(false);
            expect(found.refund).toBeUndefined();
        });

        it('should return 404 if cancellation not found', async () => {
            const user = await User.findOne({});
            user.role = 'admin';
            await user.save();
            const token = user.generateToken();
            const res = await http.post(`/api/cancelation/approve/5f3e3b2b7b3e7a2a58f2ca66`, { policy: 'No refund' }, { headers: { 'authorization': `Bearer ${token}` } });
            expect(res.status).toBe(404);
        });
    });

    describe('POST /api/cancelation/reject/:id', () => {
        it('should reject a cancellation', async () => {
            const order = await Order.findOne({});
            const user = await User.findOne({});
            user.role = 'admin';
            await user.save();
            const token = user.generateToken();
            const cancelation = new Cancelation({
                user,
                note: 'note',
                order,
                approved: false,
            });
            await cancelation.save();
            const res = await http.post(`/api/cancelation/reject/${cancelation._id}`, null, { headers: { 'authorization': `Bearer ${token}` } });
            expect(res.status).toBe(200);
            const found = await Cancelation.findById(cancelation._id);
            expect(found.approved).toBe(false);
            expect(found.refund).toBeUndefined();
        });
        it('should reject a cancellation with note', async () => {
            const order = await Order.findOne({});
            const user = await User.findOne({});
            user.role = 'admin';
            await user.save();
            const token = user.generateToken();
            const cancelation = new Cancelation({
                user,
                note: 'note',
                order,
                approved: false,
            });
            await cancelation.save();
            const res = await http.post(`/api/cancelation/reject/${cancelation._id}`, { note: 'stfu' }, { headers: { 'authorization': `Bearer ${token}` } });
            expect(res.status).toBe(200);
            const found = await Cancelation.findById(cancelation._id);
            expect(found.approved).toBe(false);
            expect(found.rejectionNote).toBe('stfu');
        });
        it('should return 404 if cancellation not found', async () => {
            const user = await User.findOne({});
            user.role = 'admin';
            await user.save();
            const token = user.generateToken();
            const res = await http.post(`/api/cancelation/reject/5f3e3b2b7b3e7a2a58f2ca66`, null, { headers: { 'authorization': `Bearer ${token}` } });
            expect(res.status).toBe(404);
        });


    });

    // GET /api/cancelation
    describe('GET /api/cancelation', () => {
        describe('User Role', () => {

            it('should return all own cancellations', async () => {
                const user = await User.findOne({});
                const token = user.generateToken();
                const order = await Order.findOne({});
                const cancelation = new Cancelation({
                    user,
                    note: 'note',
                    order,
                    approved: false,
                });
                await cancelation.save();
                const res = await http.get('/api/cancelation', { headers: { 'authorization': `Bearer ${token}` } });
                expect(res.status).toBe(200);
                // console.log(JSON.stringify(res.data, null, 2));
                expect(res.data.data).toHaveLength(1);
            });

            it('should not return other user cancellations', async () => {
                const user = await User.findOne({});
                const anotherUser = new User({
                    name: 'another user',
                    email: 'testuser@aaaa.c',
                    password: 'password',
                    verified: true,
                    disabled: false,
                });
                await anotherUser.save();
                const token = anotherUser.generateToken();
                const order = await Order.findOne({});
                const cancelation = new Cancelation({
                    user,
                    note: 'note',
                    order,
                    approved: false,
                });
                await cancelation.save();
                const res = await http.get('/api/cancelation', { headers: { 'authorization': `Bearer ${token}` } });
                expect(res.status).toBe(200);
                expect(res.data.data).toHaveLength(0);
            });
        });
        describe('Admin Role', () => {
            it('should return all cancellations', async () => {
                const user = await User.findOne({});
                const admin = new User({
                    name: 'admin',
                    email: 'admin@admin.co',
                    password: 'password',
                    role: 'admin',
                    disabled: false,
                    verified: true
                });
                await admin.save();
                const token = admin.generateToken();
                const order = await Order.findOne({});
                const cancelation = new Cancelation({
                    user,
                    note: 'note',
                    order,
                    approved: false,
                });
                await cancelation.save();
                const res = await http.get('/api/cancelation', { headers: { 'authorization': `Bearer ${token}` } });
                expect(res.status).toBe(200);
                expect(res.data.data).toHaveLength(1);
                expect(res.data.data[0]._id).toBe(cancelation._id.toString());
            });
        });
    });

});
