const Review = require('../../app/model/Review');
const Product = require('../../app/model/Product');
const database = require('../../app/config/database');
const Category = require('../../app/model/Category');
const User = require('../../app/model/User');
const { Sequence } = require('../../app/model/Sequence');
const prepareOrder = require('../fixtures/prepareOrder');
const Amenity = require('../../app/model/Amenity');
const { default: mongoose } = require('mongoose');

async function createProduct() {
    const _doc = {
        id: undefined,

        owner: new mongoose.Types.ObjectId(),

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
    const product = new Product(_doc);
    // await product.save();
    return product;
};

describe('Model Review', () => {
    let connection;
    beforeAll(async () => {
        connection = await database.connect('test_review-xs');
        await Review.deleteMany();
        await Product.deleteMany();
    });

    afterAll(async () => {
        await connection.disconnect();
    });
    afterEach(async () => {
        await Promise.all([
            Review.deleteMany(),
            Product.deleteMany(),
            Category.deleteMany(),
            User.deleteMany(),
            Sequence.deleteMany(),
        ]);
        jest.restoreAllMocks();
    });

    beforeEach(async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue(new User({ name: "User 1", email: "test@test.com", password: "test", role: "user" }));
    });

    it('should create a review for product', async () => {

        const product = await prepareOrder();
        const user = await User.findOne();
        const review = new Review({
            target: product._id,
            rating: 5,
            comment: 'This is a great product',
            user: user._id
        });
        await review.save();
        expect(review._id).toBeDefined();
        expect(review.rating).toBeDefined();
        expect(review.comment).toBeDefined();
        expect(review.target).toBeDefined();

        expect(review.target).toBe(product._id);
        expect(review.rating).toBe(5);
        expect(review.comment).toBe('This is a great product');



    });
    it('should not create a review without a product', async () => {
        const user = await User.findOne();
        const review = new Review({
            rating: 5,
            comment: 'This is a great product',
            user: user._id
        });
        expect(review.save()).rejects.toThrow();
    });
    it('should not create a review without a rating', async () => {
        const product = await createProduct();
        const user = await User.findOne();
        const review = new Review({
            product: product._id,
            comment: 'This is a great product',
            user: user._id
        });
        expect(review.save()).rejects.toThrow();
    });

    it('should not create a review without a user', async () => {
        const product = await createProduct();
        const review = new Review({
            product: product._id,
            rating: 5,
            comment: 'This is a great product'
        });
        expect(review.save()).rejects.toThrow();
    });
    it('should increase the id on each save', async () => {
        const product = await createProduct();
        const user = await User.findOne();
        const review = new Review({
            target: product._id,
            rating: 5,
            comment: 'This is a great product',
            user: user._id
        });
        await review.save();
        const id = await Sequence.findOne({ name: Review.modelName });
        expect(id.seq).toBe(1);
        const review2 = new Review({
            target: product._id,
            rating: 5,
            comment: 'This is a great product',
            user: user._id
        });
        await review2.save();
        expect(review2.id).toBeGreaterThan(review.id);
        const id2 = await Sequence.findOne({ name: Review.modelName });
        expect(id2.seq).toBe(2);
    });

    it('should find a review', async () => {
        const product = await createProduct();
        const user = await User.findOne();
        const review = new Review({
            target: product._id,
            rating: 5,
            comment: 'This is a great product',
            user: user._id
        });
        await review.save();
        const foundReview = await Review.findOne();
        expect(foundReview._id).toBeDefined();
    });

    it('should update a review', async () => {
        const product = await createProduct();
        const user = await User.findOne();
        const review = new Review({
            target: product._id,
            rating: 5,
            comment: 'This is a great product',
            user: user._id
        });
        await review.save();
        const foundReview = await Review.findOne();
        foundReview.comment = 'This is a great product, I love it';
        await foundReview.save();
        expect(foundReview.comment).toBe('This is a great product, I love it');
    });

    it('should delete a review', async () => {
        const product = await createProduct();
        const user = await User.findOne();
        const review = new Review({
            target: product._id,
            rating: 5,
            comment: 'This is a great product',
            user: user._id
        });
        await review.save();
        const foundReview = await Review.findOneAndDelete();
        const deletedReview = await Review.findById(review._id);
        expect(deletedReview).toBeNull();
    });
});
