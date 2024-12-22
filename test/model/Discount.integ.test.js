const Discount = require('../../app/model/Discount');
const database = require('../../app/config/database');
const Product = require('../../app/model/Product');
const ObjectId = require('mongoose').Types.ObjectId;

describe('Discount Model', () => {
    let connection;
    beforeAll(async () => {
        connection = await database.connect('testdiscount');
    });
    afterAll(async () => {
        await connection.disconnect();
    });

    afterEach(async () => {
        await Discount.deleteMany();
    });

    it('should create a discount', async () => {
        const doc = {
            code: 'TEST',
            type: 'percentage',
            value: 10,
            valid: {
                from: new Date(),
                to: new Date(),
            },
            min: 100,
        };
        const discount = await Discount.create(doc);
        expect(discount.code).toBe(doc.code);
        expect(discount.type).toBe(doc.type);
        expect(discount.value).toBe(doc.value);
        expect(discount.min).toBe(doc.min);

        expect(discount.valid.from.getTime()).toBe(doc.valid.from.getTime());
        expect(discount.valid.to.getTime()).toBe(doc.valid.to.getTime());

    });
    it('should omit code/categories validation if product is provided', async () => {
        const doc = {
            products: [new ObjectId()],
            type: 'percentage',
            value: 10,
            valid: {
                from: new Date(),
                to: new Date(),
            },
            min: 100,
        };
        const discount = await Discount.create(doc);

    });
    it('should omit code/products validation if categories is provided', async () => {
        const doc = {
            categories: [new ObjectId()],
            type: 'percentage',
            value: 10,
            valid: {
                from: new Date(),
                to: new Date(),
            },
            min: 100,
        };
        const discount = await Discount.create(doc);

    });
    it('should throw validation error if code or categories or products not provided ', async () => {
        const doc = {
            type: 'percentage',
            value: 10,
            valid: {
                from: new Date(),
                to: new Date(),
            },
            min: 100,
        };
        expect(Discount.create(doc)).rejects.toThrow();

    });

    it('should handle duplicate discount code', async () => {
        const doc = {
            code: 'TEST',
            type: 'percentage',
            value: 10,
            valid: {
                from: new Date(),
                to: new Date(),
            },
        };
        await Discount.create(doc);
        try {
            await Discount.create(doc);
        } catch (error) {
            expect(error.code).toBe(11000);
        }
    }
    );

    it('should handle discount validation', async () => {
        const doc = {
            valid: {
                from: new Date(),
                to: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
            },
        };
        expect(Discount.create(doc)).rejects.toThrow();
    });

    it('should get a discount', async () => {
        const doc = {
            code: 'TEST',
            type: 'percentage',
            value: 10,
            valid: {
                from: new Date(),
                to: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
            },
        };
        const discount = await Discount.create(doc);
        const found = await Discount.findById(discount._id);
        expect(found.code).toBe(doc.code);
        expect(found.type).toBe(doc.type);
        expect(found.value).toBe(doc.value);
        expect(found.valid.from.getTime()).toBe(doc.valid.from.getTime());
        expect(found.valid.to.getTime()).toBe(doc.valid.to.getTime());
    });
    it('should update a discount', async () => {
        const doc = {
            code: 'TEST',
            type: 'percentage',
            value: 10,
            valid: {
                from: new Date(),
                to: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
            },
        };
        const discount = await Discount.create(doc);
        const update = {
            code: 'TEST2',
            type: 'fixed',
            value: 100,
            valid: {
                from: new Date(),
                to: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
            },
        };
        await Discount.updateOne({ _id: discount._id }, update);
        const found = await Discount.findById(discount._id);
        expect(found.code).toBe(update.code);
        expect(found.type).toBe(update.type);
        expect(found.value).toBe(update.value);
        expect(found.valid.from.getTime()).toBe(update.valid.from.getTime());
        expect(found.valid.to.getTime()).toBe(update.valid.to.getTime());
    });
    it('should delete a discount', async () => {
        const doc = {
            code: 'TEST',
            type: 'percentage',
            value: 10,
            valid: {
                from: new Date(),
                to: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
            },
        };
        const discount = await Discount.create(doc);
        await Discount.deleteOne({ _id: discount._id });
        const found = await Discount.findById(discount._id);
        expect(found).toBeNull();
    });

    describe('Discount.isValid', () => {
        it('should return true if the discount is valid', async () => {
            const discount = new Discount({
                valid: {
                    from: new Date(),
                    to: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
                },
            });
            expect(discount.isValid()).toBe(true);
        });
        it('should return false if the discount is not valid', async () => {
            const discount = new Discount({
                valid: {
                    from: new Date(new Date().getTime() - 1000 * 60 * 60 * 24),
                    to: new Date(new Date().getTime() - 1000 * 60 * 60 * 24),
                },
            });
            expect(discount.isValid()).toBe(false);
        });
    });
    describe('Discount.calculate', () => {
        it('should calculate the discount by percentage', async () => {
            const discount = new Discount({
                type: 'percentage',
                value: 10,
                valid: {
                    from: new Date(),
                    to: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
                },
            });
            const amount = 100;
            expect(discount.calculate(amount)).toBe(10);
        });

        it('should calculate the discount by fixed', async () => {
            const discount = new Discount({
                type: 'fixed',
                value: 10,
                valid: {
                    from: new Date(),
                    to: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
                },
            });
            const amount = 100;
            expect(discount.calculate(amount)).toBe(90);
        });

        it('should calculate the discount by flat', async () => {
            const discount = new Discount({
                type: 'flat',
                value: 10,
                valid: {
                    from: new Date(),
                    to: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
                },
            });
            const amount = 100;
            expect(discount.calculate(amount)).toBe(10);
        });

        it('should return 0 if the discount is not valid', async () => {
            const discount = new Discount({
                type: 'flat',
                value: 10,
                valid: {
                    from: new Date(new Date().getTime() - 1000 * 60 * 60 * 24),
                    to: new Date(new Date().getTime() - 1000 * 60 * 60 * 24),
                },
            });
            const amount = 100;
            expect(discount.calculate(amount)).toBe(0);
        });

        it('should return 0 if the min amount is not met', async () => {
            const discount = new Discount({
                type: 'flat',
                value: 10,
                valid: {
                    from: new Date(),
                    to: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
                },
                min: 200,
            });
            const amount = 100;
            expect(discount.calculate(amount)).toBe(0);
        });
    });

    describe('Discount.isApplicable', () => {
        it('should return true if the discount is applicable to the product', async () => {

            const product = new Product();
            const discount = new Discount({
                products: [product._id],
            });

            expect(discount.isApplicable(product)).toBe(true);
        });

        it('should return false if the discount is not applicable to the product', async () => {
            const product = new Product();

            const discount = new Discount({
                products: [new ObjectId()],
            });

            expect(discount.isApplicable(product)).toBe(false);
        });

        it('should return true if the discount is applicable to the category', async () => {


            const discount = new Discount({
                categories: [{ _id: new ObjectId() }],
            });
            const product = {
                categories: discount.categories,
            };
            expect(discount.isApplicable(product)).toBe(true);
        });

        it('should return false if the discount is not applicable to the category', async () => {
            const discount = new Discount({
                categories: [{ _id: new ObjectId() }],
            });
            const product = {
                categories: [{ _id: new ObjectId() }],
            };
            expect(discount.isApplicable(product)).toBe(false);
        });

        it('should return false if the discount is not applicable to the product or category', async () => {
            const discount = new Discount({
                categories: [{ _id: new ObjectId() }],
            });
            const product = {
                categories: [{ _id: new ObjectId() }],
            };
            expect(discount.isApplicable(product)).toBe(false);
        });
    });
});
