const Cart = require('../../app/model/Cart');
const prepareOrder = require('../fixtures/prepareOrder');
const app = require('../../app');
const request = require('supertest');
const User = require('../../app/model/User');
const Product = require('../../app/model/Product');
const { Grant } = require('../../app/model/Grant');
const { Permission } = require('accesscontrol/lib/core/Permission');
const { default: mongoose } = require('mongoose');

describe('Routes: Cart', () => {
    let connection;
    beforeAll(async () => {
        connection = await require('../../app/config/database').connect('test-cart-db');
        await prepareOrder();
    });
    afterAll(async () => {
        await Cart.deleteMany({});
        await connection.disconnect();
    });
    const user = new User({ verified: true, disabled: false, role: 'user' });

    afterEach(async () => {
        await Cart.deleteMany({});
        jest.restoreAllMocks();
    });
    beforeEach(async () => {
        jest.spyOn(Grant, 'find').mockResolvedValue([
            new Grant({ role: 'user', resource: 'cart', action: 'read', possession: 'own', attributes: ['*'] }),
            new Grant({ role: 'user', resource: 'cart', action: 'create', possession: 'own', attributes: ['*'] }),
            new Grant({ role: 'user', resource: 'cart', action: 'update', possession: 'own', attributes: ['*'] }),
            new Grant({ role: 'user', resource: 'cart', action: 'delete', possession: 'own', attributes: ['*'] }),
        ]);
    });


    describe('GET /api/cart', () => {
        it('should not return 404', async () => {
            const response = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${user.generateToken()}`);
            expect(response.status).not.toBe(404);
        });

        it('should return 401 if no token', async () => {
            const response = await request(app)
                .get('/api/cart')
                .expect(401);
        });

        it('should return the cart', async () => {
            jest.spyOn(User, 'findById').mockResolvedValue(user);

            const product = await Product.findOne();
            const cart = new Cart({ user: user._id, product: product._id, quantity: 1 });
            await cart.save();
            const cartItem2 = new Cart({ user: user._id, product: product._id, quantity: 2 });
            await cartItem2.save();
            // console.log(found);
            const response = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${user.generateToken()}`);
            expect(response.status).toBe(200);
            console.log(JSON.stringify(response.body, null, 2));
            expect(response.body.products[0].product._id).toEqual(product._id.toString());
        });

        it('should return the cart with filter', async () => {
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const filter = jest.spyOn(Permission.prototype, 'filter');

            const product = await Product.findOne();
            const cart = new Cart({ user: user._id, product: product._id, quantity: 1 });
            await cart.save(); await cart.save();
            const response = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${user.generateToken()}`);
            expect(response.status).toBe(200);
            console.log(response.body);
            expect(filter).toHaveBeenCalled();
            expect(response.body.products[0].product._id).toEqual(product._id.toString());
        });

        it('should handle error', async () => {
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            jest.spyOn(Cart, 'aggregate').mockRejectedValue(new Error('error'));
            const response = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${user.generateToken()}`);
            expect(response.status).toBe(500);
        });
    });

    describe('POST /api/cart', () => {
        it('should not return 404', async () => {
            const response = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${user.generateToken()}`);
            expect(response.status).not.toBe(404);
        });

        it('should return 401 if no token', async () => {
            const response = await request(app)
                .post('/api/cart')
                .expect(401);
        });

        it('should create a cart', async () => {
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const product = await Product.findOne();
            const response = await request(app)
                .post('/api/cart')
                .send({ product: product._id, quantity: 1 })
                .set('Authorization', `Bearer ${user.generateToken()}`);
            expect(response.status).toBe(201);
            expect(response.body.product).toEqual(product._id.toString());
        });


        it('should handle validation error', async () => {
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const response = await request(app)
                .post('/api/cart')
                .send({ quantity: 1 })
                .set('Authorization', `Bearer ${user.generateToken()}`);
            expect(response.status).toBe(400);
        });

        it('should handle error', async () => {
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            jest.spyOn(Cart, 'findOneAndUpdate').mockRejectedValue(new Error('error'));
            const id = new mongoose.Types.ObjectId()
            const response = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${user.generateToken()}`)
                .send({ product: id, quantity: 1 });
            expect(response.status).toBe(500);

        });
    });

    describe('DELETE /api/cart/:product', () => {
        it('should not return 404', async () => {
            const response = await request(app)
                .delete('/api/cart/1')
                .set('Authorization', `Bearer ${user.generateToken()}`);
            expect(response.status).not.toBe(404);
        });

        it('should return 401 if no token', async () => {
            const response = await request(app)
                .delete('/api/cart/1')
                .expect(401);
        });

        it('should delete a cart', async () => {
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const product = await Product.findOne();
            const cart = new Cart({ user: user._id, product: product._id, quantity: 1 });
            await cart.save();
            const response = await request(app)
                .delete(`/api/cart/${product._id}`)
                .set('Authorization', `Bearer ${user.generateToken()}`);
            expect(response.status).toBe(204);
        });

        it('should handle error', async () => {
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            jest.spyOn(Cart, 'findOneAndDelete').mockRejectedValue(new Error('error'));
            const response = await request(app)
                .delete('/api/cart/1')
                .set('Authorization', `Bearer ${user.generateToken()}`);
            expect(response.status).toBe(500);
        });
    });
}); 