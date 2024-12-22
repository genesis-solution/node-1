const { connect } = require('../../app/config/database');
const controller = require('../../app/controller/checkout');
const Cancelation = require('../../app/model/Cancelation');
const Category = require('../../app/model/Category');
const Order = require('../../app/model/Order');
const Product = require('../../app/model/Product');
const User = require('../../app/model/User');
const prepareOrder = require('../fixtures/prepareOrder');



describe('Checkout Controller', () => {
    let connection;
    beforeAll(async () => {
        connection = await connect('test-db-checkout');
    });
    afterAll(async () => {
        await Category.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        await User.deleteMany({});
        await Cancelation.deleteMany({});
        await connection.disconnect();
    });
    beforeEach(async () => {
        await prepareOrder();
    });
    afterEach(async () => {

        await Promise.all([
            Order.deleteMany({}),
            Category.deleteMany({}),
            Product.deleteMany({}),
            Order.deleteMany({}),
            User.deleteMany({}),
        ]);

    });

    describe.skip('requestPayment', () => { });
    describe('onPaymentSuccess', () => {

        it('should call Order.findOne with order', async () => {
            const order = await Order.findOne({});
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
                app: {
                    render: jest.fn()
                }
            };
            const transaction = {};
            const metadata = {};
            const findOneOrder = jest.spyOn(Order, 'findOne');
            await controller.onPaymentSuccess(order._id, res, transaction, metadata);
            expect(findOneOrder).toHaveBeenCalledWith({ _id: order._id });
            findOneOrder.mockRestore();
        });
        it('should return 200 OK if order is already paid', async () => {
            const order = await Order.findOne({});
            order.transection = { status: 'completed' };
            await order.save();
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
            };
            const metadata = {};
            const transection = {};
            const findOneOrder = jest.spyOn(Order, 'findOne');
            await controller.onPaymentSuccess(order._id, res, transection, metadata);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith('OK');
            findOneOrder.mockRestore();
        });

        it('should cancel Order if product is not available', async () => {
            const order = await Order.findOne({});
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
            };
            const metadata = {};
            const transection = {};
            const findProduct = jest.spyOn(Product, 'aggregate');
            findProduct.mockResolvedValue([]);
            const cancelOrder = jest.spyOn(Cancelation, 'create');
            cancelOrder.mockResolvedValue({});
            await controller.onPaymentSuccess(order._id, res, transection, metadata);
            expect(cancelOrder).toHaveBeenCalledWith({ user: expect.objectContaining({_id: order.user}), reason: 'Out of stock', note: 'Product is out of stock', order: order._id });
            findProduct.mockRestore();
            cancelOrder.mockRestore();


        });
        it('should cancel order if product is out of stock', async () => {

            const order = await Order.findOne({});
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
            };
            const metadata = {};
            const transection = {};
            const findProduct = jest.spyOn(Product, 'aggregate');
            findProduct.mockResolvedValue([]);
            const cancelOrder = jest.spyOn(Cancelation, 'create');
            cancelOrder.mockResolvedValue({});
            await controller.onPaymentSuccess(order._id, res, transection, metadata);
            expect(cancelOrder).toHaveBeenCalledWith({ user: expect.objectContaining({_id: order.user}), reason: 'Out of stock', note: 'Product is out of stock', order: order._id });
            findProduct.mockRestore();
            cancelOrder.mockRestore();
        });

        it('should update order transaction status', async () => {
            const order = await Order.findOne({});
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
                app: {
                    render: jest.fn()
                }
            };
            const metadata = {};
            const transection = {
                id: '123',
                gateway: 'mockpay'
            };
            const findOneOrder = jest.spyOn(Order, 'findOne');
            const updateOrder = jest.spyOn(Order, 'updateOne');
            updateOrder.mockResolvedValue({ n: 1, nModified: 1, ok: 1 });
            await controller.onPaymentSuccess(order._id, res, transection, metadata);
            expect(updateOrder).toHaveBeenNthCalledWith(1, { _id: order._id }, {
                $set: {
                    'transection.status': 'completed',
                    'transection.metadata': metadata,
                    'transection.id': '123',
                    'transection.gateway': 'mockpay',
                }
            });
            findOneOrder.mockRestore();
            updateOrder.mockRestore();
        });
        it('should update order status to out of stock if product is out of stock', async () => {
            const order = await Order.findOne({});
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
                app: {
                    render: jest.fn()
                }
            };
            const metadata = {};
            const transection = {};
            const findProduct = jest.spyOn(Product, 'aggregate');
            findProduct.mockResolvedValue([]);
            const updateOrder = jest.spyOn(Order, 'updateOne');
            updateOrder.mockResolvedValue({ n: 1, nModified: 1, ok: 1 });
            await controller.onPaymentSuccess(order._id, res, transection, metadata);
            expect(updateOrder).toHaveBeenCalledWith({ _id: order._id }, { $set: { status: 'out of stock' } });
            findProduct.mockRestore();
            updateOrder.mockRestore();
        });
        it('should return 200 OK if product is out of stock', async () => {
            const order = await Order.findOne({});
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
                app: {
                    render: jest.fn()
                }
            };
            const transaction = {};
            const metadata = {};
            const findProduct = jest.spyOn(Product, 'find');
            const updateOrder = jest.spyOn(Order, 'updateOne');
            updateOrder.mockResolvedValue({ n: 1, nModified: 1, ok: 1 });
            await controller.onPaymentSuccess(order._id, res, transaction, metadata);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith('OK');
            findProduct.mockRestore();
            updateOrder.mockRestore();
        });
        it('should update order status to confirmed if product is available', async () => {
            const order = await Order.findOne({});
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
                app: {
                    render: jest.fn()
                }
            };
            const metadata = {};
            const transaction = {};
            const findProduct = jest.spyOn(Product, 'find');
            const updateOrder = jest.spyOn(Order, 'updateOne');
            updateOrder.mockResolvedValue({ n: 1, nModified: 1, ok: 1 });
            await controller.onPaymentSuccess(order._id, res, transaction, metadata);
            expect(updateOrder).toHaveBeenCalledWith({ _id: order._id }, { $set: { status: 'confirmed' } });
            findProduct.mockRestore();
            updateOrder.mockRestore();
        });
        it('should update products stock if product is available', async () => {
            const order = await Order.findOne({});
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
                app: {
                    render: jest.fn()
                }
            };
            const metadata = {};
            const transaction = {};
            const findProduct = jest.spyOn(Product, 'find');
            const updateOrder = jest.spyOn(Order, 'updateOne');
            updateOrder.mockResolvedValue({ n: 1, nModified: 1, ok: 1 });
            const updateProduct = jest.spyOn(Product, 'updateOne');
            updateProduct.mockResolvedValue({ n: 1, nModified: 1, ok: 1 });
            await controller.onPaymentSuccess(order._id, res, transaction, metadata);
            findProduct.mockRestore();
            updateOrder.mockRestore();
            updateProduct.mockRestore();
        });
        it('should return 200 OK if product is available', async () => {
            const order = await Order.findOne({});
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
                app: {
                    render: jest.fn()
                }
            };
            const transaction = {};
            const metadata = {};
            const findProduct = jest.spyOn(Product, 'find');
            const updateOrder = jest.spyOn(Order, 'updateOne');
            updateOrder.mockResolvedValue({ n: 1, nModified: 1, ok: 1 });
            const updateProduct = jest.spyOn(Product, 'updateOne');
            updateProduct.mockResolvedValue({ n: 1, nModified: 1, ok: 1 });
            await controller.onPaymentSuccess(order._id, res, transaction, metadata);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith('OK');
            findProduct.mockRestore();
            updateOrder.mockRestore();
            updateProduct.mockRestore();
        });

    });
    describe.skip('onPaymentFailed', () => { });
    describe.skip('onPaymentCancelled', () => { });
    it.skip('', () => { });
});