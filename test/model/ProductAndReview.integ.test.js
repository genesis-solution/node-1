const { connect } = require("../../app/config/database");
const Amenity = require("../../app/model/Amenity");
const Category = require("../../app/model/Category");
const Product = require("../../app/model/Product");
const Review = require("../../app/model/Review");
const User = require("../../app/model/User");

const debug = require('debug')("app:test:model:ProductAndReview");

describe('Product + Review model', () => {
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

    let connection;
    beforeAll(async () => {
        process.env['DEBUG'] = 'app:test:model:ProductAndReview';
        connection = await connect('review-integ-test');
    });
    afterAll(async () => {
        await Promise.all([
            Category.deleteMany({}),
            Product.deleteMany({}),
            Review.deleteMany({}),
            User.deleteMany({}),
        ]);
        await connection.disconnect();
    });

    afterEach(async () => {
        await Promise.all([
            Category.deleteMany({}),
            Product.deleteMany({}),
            Review.deleteMany({}),
            User.deleteMany({}),
        ]);
    });

    describe('Product.fetch', () => {
        it('should return all products with reviews (average_rating, review_count)', async () => {
            // prepare
            const product = new Product(_doc);
            const user = new User({ email: "test@user.com", password: "password", name: 'test user' });
            const review = new Review({ target: product._id, user: user._id, rating: 5, comment: "Good product" });
            await Promise.all([ product.save(), user.save(), review.save()]);
            // test
            const products = await Product.fetch();
            // console.log(products);; 
            // verify
            expect(products).toHaveLength(1);
            expect(products[0].name).toBe(_doc.name);
            expect(products[0].average_rating).toBe(5);
            expect(products[0].review_count).toBe(1);

        });

    });
});