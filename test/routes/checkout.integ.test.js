const Order = require('../../app/model/Order');
const Product = require('../../app/model/Product');
const User = require('../../app/model/User');
const Category = require('../../app/model/Category');
const Discount = require('../../app/model/Discount');
const app = require('../../app');
const { http, server } = require('../fixtures/bettersupertest')(app);
const { connect } = require('../../app/config/database');
const { Grant } = require('../../app/model/Grant');
const Amenity = require('../../app/model/Amenity');
const ChargeRate = require('../../app/model/ChargeRate');
const controller = require('../../app/controller/checkout');
let user;
let token;
let product1;
let product2;
let category1;
let discount;
let connection;

beforeAll(async () => {
    connection = await connect('test_checkout');
    user = await User.create({
        name: 'John Doe',
        email: 'test@test.com',
        password: 'password',
        disabled: false,
        verified: true,
    });
    token = user.generateToken();
    category1 = await Category.create({
        name: 'category1',
        image: 'image1'
    });

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

    product1 = await Product.create({
        ..._doc,
        name: 'product1',
        price: 100,
        categories: [category1._id]
    });
    product2 = await Product.create({
        ..._doc,
        name: 'product2',
        price: 200,
        categories: [category1._id]
    });
    discount = await Discount.create({
        code: 'DISCOUNT',
        value: 10,
        type: 'percentage',
        valid: {
            from: new Date(),
            to: new Date(new Date().getTime() + 1000 * 60 * 60 * 24)
        }
    });

    await Grant.create([
        new Grant({ role: 'owner', resource: 'checkout', action: 'create', possession: 'any', attributes: ['*'] }),
        new Grant({ role: 'user', resource: 'checkout', action: 'create', possession: 'own', attributes: ['*'] })
    ]);

});

afterAll(async () => {
    await Promise.all([
        Product.deleteMany(),
        Category.deleteMany(),
        User.deleteMany(),
        Discount.deleteMany(),
        Order.deleteMany(),
        Grant.deleteMany()
    ]);
    await connection.disconnect();
    server.close();
});

afterEach(async () => {
    jest.restoreAllMocks();
    await Order.deleteMany();
});

describe('POST /api/checkout', () => {
    beforeEach(async () => {
        jest.spyOn(controller, 'requestPayment').mockResolvedValueOnce(undefined);
    });

    it('should not not return 404', async () => {
        const res = await http.post('/api/checkout', {
            products: [
                { product: product1._id, guests: 1 },
                { product: product2._id, guests: 1 }
            ],
            discount: discount.code
        },
            {
                headers: {
                    authorization: `Bearer ${token}`
                },
                maxRedirects: 0
            }
        );

        expect(res.status).not.toBe(404);
    });

    it('should return 400 if products are not provided', async () => {
        const res = await http.post('/api/checkout', {
            discount: discount.code,
            rent: {
                start: new Date(),
                end: new Date()
            }
        },
            {
                headers: {
                    authorization: `Bearer ${token}`
                }
            }
        );
        // console.log(res.data);
        expect(res.status).toBe(400);
    });
    it('should return 400 if products are not mongoid', async () => {
        const res = await http.post('/api/checkout', {
            discount: discount.code,
            products: [
                { product: 'invalid', guests: 1 },
                { product: 'invalid', guests: 1 }
            ],
            rent: {
                start: new Date(),
                end: new Date()
            }
        },
            {
                headers: {
                    authorization: `Bearer ${token}`
                }
            }
        );
        // console.log(res.data);
        expect(res.status).toBe(400);
    });
    it('should return 400 if discount is empty string', async () => {
        const res = await http.post('/api/checkout', {
            products: [
                { product: product1._id, guests: 1 },
                { product: product2._id, guests: 1 }
            ],
            discount: '',
            rent: {
                start: new Date(),
                end: new Date()
            }
        },
            {
                headers: {
                    authorization: `Bearer ${token}`
                }
            }
        );
        // console.log(res.data);
        expect(res.status).toBe(400);
    });
    it('should return 400 if rent not provided', async () => {
        const res = await http.post('/api/checkout', {
            products: [
                { product: product1._id, guests: 1 },
                { product: product2._id, guests: 1 }
            ],
            discount: 'test',
        },
            {
                headers: {
                    authorization: `Bearer ${token}`
                }
            }
        );
        // console.log(res.data);
        expect(res.status).toBe(400);
    });
    it('should return 400 if rent start or end is invalid', async () => {
        const res = await http.post('/api/checkout', {
            products: [
                { product: product1._id, guests: 1 },
                { product: product2._id, guests: 1 }
            ],
            discount: 'test',
            rent: {
                start: 'invalid',
                end: 'invalid'
            }
        },
            {
                headers: {
                    authorization: `Bearer ${token}`
                }
            }
        );
        // console.log(res.data);
        expect(res.status).toBe(400);
    });
    it('should return 400 if rent start time and end time is less than 1 hour', async () => {
        const res = await http.post('/api/checkout', {
            products: [
                { product: product1._id, guests: 1 },
            ],
            rent: {
                start: new Date(),
                end: new Date()
            }
        },
            {
                headers: {
                    authorization: `Bearer ${token}`
                }
            }
        );
        // console.log(res.data);
        expect(res.status).toBe(400);
    });



    it('should return unauthorized if token is not provided', async () => {
        const res = await http.post('/api/checkout', {
            products: [
                { product: product1._id, guests: 1 },
            ],
            discount: discount.code,
            rent: {
                start: new Date(),
                end: new Date()
            }
        });

        expect(res.status).toBe(401);
    });

    it('should return forbidden if user have invalid role', async () => {
        const user = await User.findOneAndUpdate({ email: 'test@nouser.com' }, {
            name: 'John Doe',
            email: 'test@nouser.com',
            password: 'password',
            role: 'invalid',
            verified: true,
            disabled: false,
        }, { upsert: true, new: true });

        const token = user.generateToken();
        const res = await http.post('/api/checkout', {
            products: [
                { product: product1._id, guests: 1 },
            ],
            discount: discount.code
        },
            {
                headers: {
                    authorization: `Bearer ${token}`
                }
            }
        );
        expect(res.status).toBe(403);
    });

    it('should handle unexpected error', async () => {
        const findUserById = jest.spyOn(User, 'findById')
            .mockResolvedValue(user);
        const userExists = jest.spyOn(User, 'exists')
            .mockRejectedValueOnce(new Error('Unexpected Error'));
        const res = await http.post('/api/checkout', {
            products: [
                { product: product1._id, guests: 1 },
                { product: product2._id, guests: 1 }
            ],
            discount: discount.code,
            rent: {
                start: new Date(),
                end: new Date(new Date().getTime() + 1000 * 60 * 60)
            }
        },
            {
                headers: {
                    authorization: `Bearer ${token}`
                }
            }
        );
        expect(res.status).toBe(500);
    });

    it('should return 400 if discount is invalid and not found', async () => {
        const res = await http.post('/api/checkout', {
            products: [
                { product: product1._id, guests: 1 },
                { product: product2._id, guests: 1 }
            ],
            discount: 'INVALID',
            rent: {
                start: new Date(),
                end: new Date(new Date().getTime() + 1000 * 60 * 60)
            }
        },
            {
                headers: {
                    authorization: `Bearer ${token}`
                }
            }
        );
        console.log(res.data);
        expect(res.status).toBe(400);
    });

    it("should return redirect to on success", async () => {
        const res = await http.post('/api/checkout', {
            products: [
                { product: product1._id, guests: 1 },
            ],
            discount: discount.code,
            rent: {
                start: new Date(),
                end: new Date(new Date().getTime() + 1000 * 60 * 60), // 1 hour
            }
        },
            {
                headers: {
                    authorization: `Bearer ${token}`
                },
                maxRedirects: 0
            }
        );

        expect(res.status).toBe(302);
    });

    it("should create a order with pending status", async () => {
        jest.spyOn(ChargeRate, 'findOne').mockResolvedValueOnce({ taxRate: 10, serviceFee: 10 });
        const res = await http.post('/api/checkout', {
            products: [
                { product: product1._id, guests: 1 },
            ],
            rent: {
                start: new Date(),
                end: new Date(new Date().getTime() + 1000 * 60 * 60), // 1 hour
            }
        },
            {
                headers: {
                    authorization: `Bearer ${token}`
                },
                maxRedirects: 0
            }
        );

        expect(res.status).toBe(302);
        const order = await Order.findOne({ 'transection.status': 'pending' });
        expect(order).toBeTruthy();
        expect(order.products.length).toBe(1);
        expect(order.amount).toBe(120);
    });

    it("should create a order with discount", async () => {
        const res = await http.post('/api/checkout', {
            products: [
                { product: product1._id, guests: 1 },
                { product: product2._id, guests: 1 }
            ],
            discount: discount.code,
            rent: {
                start: new Date(),
                end: new Date(new Date().getTime() + 1000 * 60 * 60), // 1 hour
            },
        },
            {
                headers: {
                    authorization: `Bearer ${token}`
                },
                maxRedirects: 0
            }
        );

        expect(res.status).toBe(302);
        const order = await Order.findOne({ 'transection.status': 'pending' });
        expect(order).toBeTruthy();
        expect(order.products.length).toBe(2);
        expect(order.amount).toBe(270);
    });


    it("should return 400 if discount is invalid", async () => {
        const res = await http.post('/api/checkout', {
            products: [
                { product: product1._id, guests: 1 },
                { product: product2._id, guests: 1 }
            ],
            discount: 'INVALID',
            rent: {
                start: new Date(),
                end: new Date(new Date().getTime() + 1000 * 60 * 60), // 1 hour
            },
        },
            {
                headers: {
                    authorization: `Bearer ${token}`
                }
            }
        );

        expect(res.status).toBe(400);
    });

    describe('Check product availability', () => {
        it('should return 400 if someone reserved the product with same time', async () => {
            const start = new Date();
            const end = new Date(new Date().getTime() + 1000 * 60 * 60); // 1 hour
            const order = await Order.create({
                user: user._id,
                products: [
                    { product: product1._id, guests: 1, amount: 120, owner: product1.owner },
                ],
                rent: {
                    start,
                    end
                },
                amount: 120,
                status: 'confirmed',
            });
            const res = await http.post('/api/checkout', {
                products: [
                    { product: product1._id, guests: 1 },
                ],
                rent: {
                    start: start,
                    end: end, // 1 hour
                },
            },
                {
                    headers: {
                        authorization: `Bearer ${token}`
                    },
                    maxRedirects: 0
                },
            );

            expect(res.status).toBe(400);
        });

        it('should return 400 if someone reserved the product start time is between the rent start and end', async () => {
            const start = new Date();
            const end = new Date(new Date().getTime() + 1000 * 60 * 60); // 1 hour
            const order = await Order.create({
                user: user._id,
                products: [
                    { product: product1._id, guests: 1, amount: 120, owner: product1.owner },
                ],
                rent: {
                    start,
                    end
                },
                amount: 120,
                status: 'confirmed',
            });
            const res = await http.post('/api/checkout', { products: [{ product: product1._id, guests: 1 }], rent: { start: new Date(start.getTime() - 1000 * 60 * 30), end: new Date(start.getTime() + 1000 * 60 * 30) } }, { headers: { authorization: `Bearer ${token}` }, maxRedirects: 0 });
            expect(res.status).toBe(400);
        });

        it('should return 400 if someone reserved the product end time is between the rent start and end', async () => {
            const start = new Date();
            const end = new Date(new Date().getTime() + 1000 * 60 * 60); // 1 hour
            const order = await Order.create({
                user: user._id,
                products: [
                    { product: product1._id, guests: 1, amount: 120, owner: product1.owner },
                ],
                rent: {
                    start,
                    end
                },
                amount: 120,
                status: 'confirmed',
            });
            const res = await http.post('/api/checkout', { products: [{ product: product1._id, guests: 1 }], rent: { start: new Date(end.getTime() - 1000 * 60 * 30), end: new Date(end.getTime() + 1000 * 60 * 30) } }, { headers: { authorization: `Bearer ${token}` }, maxRedirects: 0 });
            expect(res.status).toBe(400);
        });

        it('should return 400 if someone reserved the product rent time is between the start and end', async () => {
            const start = new Date();
            const end = new Date(new Date().getTime() + 1000 * 60 * 60); // 1 hour
            const order = await Order.create({
                user: user._id,
                products: [
                    { product: product1._id, guests: 1, amount: 120, owner: product1.owner },
                ],
                rent: {
                    start,
                    end
                },
                amount: 120,
                status: 'confirmed',
            });
            const res = await http.post('/api/checkout', {
                products: [{ product: product1._id, guests: 1 }],
                rent: {
                    start: new Date(start.getTime() + 1000 * 60 * 30), // 30 minutes after start
                    end: new Date(end.getTime() - 1000 * 60 * 30) // 30 minutes before end
                }
            }, { headers: { authorization: `Bearer ${token}` }, maxRedirects: 0 });
            expect(res.status).toBe(400);
        });

        it('should return 200 if someone reserved the product but cancelled', async () => {
            const start = new Date();
            const end = new Date(new Date().getTime() + 1000 * 60 * 60); // 1 hour
            const order = await Order.create({
                user: user._id,
                products: [
                    { product: product1._id, guests: 1, amount: 120, owner: product1.owner },
                ],
                rent: {
                    start,
                    end
                },
                amount: 120,
                status: 'cancelled',
            });
            const res = await http.post('/api/checkout', {
                products: [{ product: product1._id, guests: 1 }],
                rent: {
                    start: start,
                    end: end
                }
            }, { headers: { authorization: `Bearer ${token}` }, maxRedirects: 0 });
            expect(res.status).toBe(302);
        });

        it('should return 400 if someone reserced the product within 4hour of the rent time', async () => {
            const start = new Date();
            const end = new Date(new Date().getTime() + 1000 * 60 * 60); // 1 hour
            const COOLDOWN = 4 * 60 * 60 * 1000; // 4 hours
            const _1_HOUR = 1000 * 60 * 60;
            const order = await Order.create({
                user: user._id,
                products: [
                    { product: product1._id, guests: 1, amount: 120, owner: product1.owner },
                ],
                rent: { start, end },
                amount: 120,
                status: 'confirmed',
            });
            const res = await http.post('/api/checkout', {
                products: [{ product: product1._id, guests: 1 }],
                rent: {
                    start: new Date(end.getTime() + COOLDOWN), // 4Hour before end
                    end: new Date(end.getTime() + COOLDOWN + _1_HOUR) //  1 hour 30 minutes before end
                }
            }, { headers: { authorization: `Bearer ${token}` }, maxRedirects: 0 });
            // console.log(res.data);
            expect(res.status).toBe(400);
        });

        it('should return 302 if someone reserved the product after 4hour of the rent time', async () => {
            const start = new Date();
            const end = new Date(new Date().getTime() + 1000 * 60 * 60); // 1 hour
            const COOLDOWN = 4 * 60 * 60 * 1000 + 1; // 4 hours
            const _1_HOUR = 1000 * 60 * 60;
            const order = await Order.create({
                user: user._id,
                products: [
                    { product: product1._id, guests: 1, amount: 120, owner: product1.owner },
                ],
                rent: { start, end },
                amount: 120,
                status: 'confirmed',
            });
            const res = await http.post('/api/checkout', {
                products: [{ product: product1._id, guests: 1 }],
                rent: {
                    start: new Date(end.getTime() + COOLDOWN), // 4Hour after end
                    end: new Date(end.getTime() + COOLDOWN + _1_HOUR) //  1 hour 30 minutes after end
                }
            }, { headers: { authorization: `Bearer ${token}` }, maxRedirects: 0 });
            // console.log(res.data);
            expect(res.status).toBe(302);
        });
    });

    describe('Owner', () => {
        const owner = new User({
            role: 'owner',
            disabled: false,
            verified: true,
        });
        const ownerToken = owner.generateToken();

        it('should return 400 if user is not provided', async () => {
            const findUserById = jest.spyOn(User, 'findById').mockResolvedValueOnce(owner);
            const res = await http.post('/api/checkout', {
                products: [
                    { product: product1._id, guests: 1 },
                    { product: product2._id, guests: 1 }
                ],
                discount: discount.code,
                rent: {
                    start: new Date(),
                    end: new Date(new Date().getTime() + 1000 * 60 * 60)
                }
            },
                {
                    headers: {
                        authorization: `Bearer ${ownerToken}`
                    },
                    maxRedirects: 0
                },

            );

            expect(res.status).toBe(400);
        });

        it('should return 400 if user is not ObjectID', async () => {
            const findUserById = jest.spyOn(User, 'findById').mockResolvedValueOnce(owner);
            const res = await http.post('/api/checkout', {
                user: 'invalid',
                products: [
                    { product: product1._id, guests: 1 },
                    { product: product2._id, guests: 1 }
                ],
                discount: discount.code,
                rent: {
                    start: new Date(),
                    end: new Date(new Date().getTime() + 1000 * 60 * 60)
                }
            },
                {
                    headers: {
                        authorization: `Bearer ${ownerToken}`
                    },
                    maxRedirects: 0
                },

            );

            expect(res.status).toBe(400);
        });

        it('should return 400 if user is not found', async () => {
            const findUserById = jest.spyOn(User, 'findById')
                .mockResolvedValueOnce(owner);
            const userExists = jest.spyOn(User, 'exists').mockResolvedValueOnce(null);

            const res = await http.post('/api/checkout', {
                user: owner._id,
                products: [
                    { product: product1._id, guests: 1 },
                    { product: product2._id, guests: 1 }
                ],
                discount: discount.code,
                rent: {
                    start: new Date(),
                    end: new Date(new Date().getTime() + 1000 * 60 * 60)
                }
            },
                {
                    headers: {
                        authorization: `Bearer ${ownerToken}`
                    },
                    maxRedirects: 0
                },

            );
            expect(userExists).toHaveBeenCalled();
            userExists.mockRestore();
            expect(res.status).toBe(400);
        });
    });

});