const database = require('../../app/config/database');
const Amenity = require('../../app/model/Amenity');
const Category = require('../../app/model/Category');
const Order = require('../../app/model/Order');
const Product = require('../../app/model/Product');
const { Sequence } = require('../../app/model/Sequence');
const User = require('../../app/model/User');

const _doc = {
    id: undefined,

    owner: new User(),

    draft: undefined,
    approved: undefined,
    hidden: undefined,

    docs: ['test'],
    images: ['test'],

    name: "Spot 1",
    description: "Description 1",

    price: 100,
    maxCapacity: 100,
    area: 100,

    amenities: [new Amenity(), new Amenity()],
    categories: [new Category(), new Category()],

    location: {
        location: {
            type: "Point",
            coordinates: [100, 100],
        },
        address: "Address 1",
        zipCode: "100",
        city: "City 1",
        road: "Road 1",
        state: "State 1",
        country: "Country 1",
    },

    type: undefined,

    availability: {
        Sunday: {
            open: undefined,
            close: undefined,
            holiday: undefined,
        },
        Monday: {
            open: undefined,
            close: undefined,
            holiday: undefined,
        },
        Tuesday: {
            open: undefined,
            close: undefined,
            holiday: undefined,
        },
        Wednesday: {
            open: undefined,
            close: undefined,
            holiday: undefined,
        },
        Thursday: {
            open: undefined,
            close: undefined,
            holiday: undefined,
        },
        Friday: {
            open: undefined,
            close: undefined,
            holiday: undefined,
        },
        Saturday: {
            open: undefined,
            close: undefined,
            holiday: undefined,
        },

    },

    rules: undefined,

};

async function* createProduct() {
    for (let i = 0; i < 10; i++) {

        const product = await Product.create({
            ..._doc,
            name: `Product ${i}`,
        });
        yield product;
    }
}

async function prepareTestData() {
    const product = await Product.create(_doc);
    const user = await User.create({ name: 'User 1', email: 'test@test.com', password: 'password' });
    return { user, product };
}

async function cleanTestData() {
    await Promise.all([
        Category.deleteMany({}),
        Product.deleteMany({}),
        User.deleteMany({}),
        Sequence.deleteMany({}),
        Order.deleteMany({}),
    ]);
}
describe('Order', () => {
    let connection;
    beforeAll(async () => {
        connection = await database.connect('test_order');
    });

    afterAll(async () => {
        await connection.disconnect();
    });

    afterEach(async () => {
        await cleanTestData();
    });

    it('should create an order', async () => {

        const { user, } = await prepareTestData();
        const generator = createProduct();
        const product1 = await generator.next();
        const product2 = await generator.next();
        await generator.return(); // close the generator

        const doc = {
            products: [
                {
                    product: product1.value._id,
                    amount: 100,
                    tax: 10,
                    serviceFee: 10,
                    guests: 1,
                    owner: product1.value.owner,
                },
                {
                    product: product2.value._id,
                    amount: 200,
                    tax: 20,
                    serviceFee: 20,
                    guests: 2,
                    owner: product1.value.owner,
                },
            ],
            rent: {
                start: new Date(),
                end: new Date(),
            },
            user: user._id,
            transection: {
                id: 'test',
                gateway: 'test payment gateway',
                metadata: {
                    test: 'test',
                },
                status: 'pending',
            },
            metadata: {
                test: 'test',
            },
            amount: 1000,
            discounts: new Map([['coupon', 100], ['offer', 200]]),
            charges: new Map([['shipping', 100], ['packing', 200]]),
        };
        const order = await Order.create(doc);

        expect(order).toBeDefined();
        expect(order.id).toBe(1);
        expect(order.products.length).toBe(2);

        expect(order.products[0].product.toString()).toBe(product1.value._id.toString());
        expect(order.products[0].amount).toBe(100);
        expect(order.products[0].tax).toBe(10);
        expect(order.products[0].serviceFee).toBe(10);
        expect(order.products[0].guests).toBe(1);
        expect(order.products[0].owner.toString()).toBe(product1.value.owner.toString());

        expect(order.products[1].product.toString()).toBe(product2.value._id.toString());
        expect(order.products[1].amount).toBe(200);
        expect(order.products[1].tax).toBe(20);
        expect(order.products[1].serviceFee).toBe(20);
        expect(order.products[1].guests).toBe(2);
        expect(order.products[1].owner.toString()).toBe(product2.value.owner.toString());

        expect(order.rent.start).toBeDefined();
        expect(order.rent.end).toBeDefined();

        expect(order.user.toString()).toBe(user._id.toString());

        expect(order.transection.id).toBe('test');
        expect(order.transection.gateway).toBe('test payment gateway');
        expect(order.transection.status).toBe('pending');
        expect(order.transection.metadata).toBeDefined();

        expect(order.amount).toBe(1000);

        expect(order.discounts).toBeDefined();
        expect(order.charges).toBeDefined();
        expect(order.status).toBe('payment required');



        expect(order.metadata).toBeDefined();
        expect(order.createdAt).toBeDefined();
        expect(order.updatedAt).toBeDefined();

    });
    it('should find an order', async () => {
        const { product, user } = await prepareTestData();
        const doc = {
            products: [
                {
                    product: product._id,
                    amount: 100,
                    tax: 10,
                    serviceFee: 10,
                    guests: 1,
                    owner: product.owner,

                },
            ],
            rent: {
                start: new Date(),
                end: new Date(),
            },
            user: user._id,
            transection: {
                id: 'test',
                gateway: 'test payment gateway',
                metadata: {
                    test: 'test',
                },
                status: 'pending',
            },
            metadata: {
                test: 'test',
            },
            amount: 1000,
            discounts: new Map([['coupon', 100], ['offer', 200]]),
            charges: new Map([['shipping', 100], ['packing', 200]]),
        };
        const order = await Order.create(doc);
        const foundOrder = await Order.findById(order._id);
        expect(foundOrder).toBeDefined();
        expect(foundOrder.id).toBe(1);
        expect(foundOrder.products.length).toBe(1);

        expect(foundOrder.products[0].product.toString()).toBe(product._id.toString());
        expect(foundOrder.products[0].amount).toBe(100);
        expect(foundOrder.products[0].tax).toBe(10);
        expect(foundOrder.products[0].serviceFee).toBe(10);

        expect(foundOrder.rent.start).toBeDefined();
        expect(foundOrder.rent.end).toBeDefined();

        expect(foundOrder.user.toString()).toBe(user._id.toString());
        expect(foundOrder.transection.id).toBe('test');
        expect(foundOrder.transection.gateway).toBe('test payment gateway');
        expect(foundOrder.transection.status).toBe('pending');
        expect(foundOrder.transection.metadata).toBeDefined();
        expect(foundOrder.amount).toBe(1000);
        expect(foundOrder.discounts).toBeDefined();
        expect(foundOrder.charges).toBeDefined();
        expect(foundOrder.metadata).toBeDefined();
        expect(foundOrder.createdAt).toBeDefined();
        expect(foundOrder.updatedAt).toBeDefined();

    });
    it('should find an order by date', async () => {
        const { product, user } = await prepareTestData();
        const now = new Date();
        const end = new Date(now.getTime() + 1000 * 60 * 60);

        const doc = {
            products: [
                {
                    product: product._id,
                    amount: 100,
                    tax: 10,
                    serviceFee: 10,
                    guests: 1,
                    owner: product.owner,
                },
            ],
            rent: {
                start: now,
                end: end,
            },
            user: user._id,

        };
        const order = await Order.create(doc);
        const foundOrder = await Order.findOne({
            'rent.start': {
                $gte: now,
            },
            'rent.end': {
                $lte: end,
                $gt: now,
            },
        });
        expect(foundOrder).toBeDefined();

    });

    it('should update an order', async () => {
        const { product, user } = await prepareTestData();
        const doc = {
            products: [
                {
                    product: product._id,
                    amount: 100,
                    tax: 10,
                    serviceFee: 10,
                    guests: 1,
                    owner: product.owner,
                },
            ],
            rent: {
                start: new Date(),
                end: new Date(),
            },
            user: user._id,
            transection: {
                id: 'test',
                gateway: 'test payment gateway',
                metadata: {
                    test: 'test',
                },
                status: 'pending',
            },
            metadata: {
                test: 'test',
            },
            amount: 1000,
            discounts: new Map([['coupon', 100], ['offer', 200]]),
            charges: new Map([['shipping', 100], ['packing', 200]]),
        };
        const order = await Order.create(doc);
        const updatedOrder = await Order.findByIdAndUpdate(order._id, {
            amount: 2000,
            'transection.status': 'completed',
        }, { new: true });
        expect(updatedOrder).toBeDefined();
        expect(updatedOrder.id).toBe(1);
        expect(updatedOrder.products.length).toBe(1);

        expect(updatedOrder.products[0].product.toString()).toBe(product._id.toString());
        expect(updatedOrder.products[0].amount).toBe(100);
        expect(updatedOrder.products[0].tax).toBe(10);
        expect(updatedOrder.products[0].serviceFee).toBe(10);

        expect(updatedOrder.rent.start).toBeDefined();
        expect(updatedOrder.rent.end).toBeDefined();

        expect(updatedOrder.user.toString()).toBe(user._id.toString());

        expect(updatedOrder.transection.id).toBe('test');
        expect(updatedOrder.transection.gateway).toBe('test payment gateway');
        expect(updatedOrder.transection.status).toBe('completed');
        expect(updatedOrder.transection.metadata).toBeDefined();

        expect(updatedOrder.amount).toBe(2000);
        expect(updatedOrder.discounts).toBeDefined();
        expect(updatedOrder.charges).toBeDefined();
        expect(updatedOrder.metadata).toBeDefined();
        expect(updatedOrder.createdAt).toBeDefined();
        expect(updatedOrder.updatedAt).toBeDefined();

    });
    it('should delete an order', async () => {
        const { category, product, user } = await prepareTestData();
        const doc = {
            products: [
                {
                    product: product._id,
                    amount: 100,
                    tax: 10,
                    serviceFee: 10,
                    guests: 1,
                    owner: product.owner,
                },
            ],
            rent: {
                start: new Date(),
                end: new Date(),
            },

            user: user._id,
            transection: {
                id: 'test',
                gateway: 'test payment gateway',
                metadata: {
                    test: 'test',
                },
                status: 'pending',
            },
            metadata: {
                test: 'test',
            },
            amount: 1000,
            discounts: new Map([['coupon', 100], ['offer', 200]]),
            charges: new Map([['shipping', 100], ['packing', 200]]),
        };
        const order = await Order.create(doc);
        const deletedOrder = await Order.deleteOne({ _id: order._id });
        expect(deletedOrder).toBeDefined();
        expect(deletedOrder.deletedCount).toBe(1);
    });
    it('should increment the id of the order on save', async () => {
        const { category, product, user } = await prepareTestData();
        const doc = {
            products: [
                {
                    product: product._id,
                    amount: 100,
                    tax: 10,
                    serviceFee: 10,
                    guests: 1,
                    owner: product.owner,
                },
            ],
            rent: {
                start: new Date(),
                end: new Date(),
            },

            user: user._id,
            transection: {
                id: 'test',
                gateway: 'test payment gateway',
                metadata: {
                    test: 'test',
                },
                status: 'pending',
            },
            metadata: {
                test: 'test',
            },
            amount: 1000,
            discounts: new Map([['coupon', 100], ['offer', 200]]),
            charges: new Map([['shipping', 100], ['packing', 200]]),
        };
        const order1 = await Order.create(doc);
        const order2 = await Order.create(doc);
        expect(order1.id).toBe(1);
        expect(order2.id).toBe(2);
    });
});