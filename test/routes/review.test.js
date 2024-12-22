const app = require('../../app');
const request = require('supertest');
const Review = require('../../app/model/Review');
const Product = require('../../app/model/Product');
const User = require('../../app/model/User');
const Sequence = require('../../app/model/Sequence');
const { Grant } = require('../../app/model/Grant');
const mongooseError = require('mongoose').Error;
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Amenity = require('../../app/model/Amenity');
const Category = require('../../app/model/Category');

describe('Routes: Review', () => {

    const defaultUser = new User({
        name: 'User 1',
        email: 'test@test.com',
        password: 'password',
        verified: true,
        disabled: false,
        role: 'user',
    });
    const adminUser = new User({
        name: 'User 1',
        email: 'test@test.com',
        password: 'password',
        verified: true,
        disabled: false,
        role: 'admin',
    });
    const badUser = new User({
        name: 'User 1',
        email: 'test@test.com',
        password: 'password',
        verified: true,
        disabled: false,
        role: 'test',
    });

    const defaultAuthToken = defaultUser.generateToken();
    const badUserAuthToken = badUser.generateToken();
    const adminUserAuthToken = adminUser.generateToken();


    const defaultProduct = new Product({
        id: undefined,

        owner: new ObjectId(),

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

    });

    const defaultReview = new Review({
        _id: '507f191e810c19729de860ea',
        comment: 'Description 1',
        rating: 5,
        target: defaultProduct._id,
        user: defaultUser._id
    });

    const userGrants = [
        new Grant({ role: 'user', resource: 'review', possession: 'any', action: 'read', attributes: ['*'] }),
        new Grant({ role: 'user', resource: 'review', possession: 'any', action: 'create', attributes: ['*'] }),
        new Grant({ role: 'user', resource: 'review', possession: 'own', action: 'delete', attributes: ['*'] }),
        new Grant({ role: 'user', resource: 'review', possession: 'own', action: 'update', attributes: ['*'] }),
    ];

    const adminGrants = [
        new Grant({ role: 'admin', resource: 'review', possession: 'any', action: 'create', attributes: ['*'] }),
        new Grant({ role: 'admin', resource: 'review', possession: 'any', action: 'delete', attributes: ['*'] }),
        new Grant({ role: 'admin', resource: 'review', possession: 'any', action: 'update', attributes: ['*'] }),
        new Grant({ role: 'admin', resource: 'review', possession: 'any', action: 'read', attributes: ['*'] }),
    ];

    beforeEach(() => {
        jest.spyOn(Grant, 'find').mockResolvedValue(userGrants);
        jest.spyOn(User, 'findById').mockResolvedValue(defaultUser);
    });

    let connection;
    beforeAll(async () => {
        // mongoose.set("debug", true);
        connection = await require('../../app/config/database').connect('review-test');
    });


    afterEach(async () => {
        jest.restoreAllMocks();
        await Review.deleteMany({});
    });


    afterAll(async () => {
        await connection.disconnect();
    });

    describe('GET /api/review', () => {
        it('should return a Authentication error', async () => {
            await request(app).get('/api/review').expect(401);
        });
        it('should return a list of reviews', async () => {
            // mockingoose(Review).toReturn([defaultReview], 'find');
            defaultProduct.save();
            await Review.create(defaultReview);
            await defaultUser.save();
            const response = await request(app)
                .get('/api/review')
                .set('Authorization', `Bearer ${defaultAuthToken}`)
                .expect(200);
            expect(response.body.reviews[0]).toMatchObject(
                {
                    comment: defaultReview.comment,
                    rating: defaultReview.rating,
                    target: expect.objectContaining({
                        _id: defaultProduct._id.toString(),
                    }),
                    user: expect.objectContaining({
                        _id: defaultUser._id.toString(),
                    }),
                    _id: defaultReview._id.toString()
                }
            );
            expect(response.body.total).toBe(1);
        });
        it('should handle errors', async () => {
            // mockingoose(Review).toReturn(new Error('Error'), 'find');
            jest.spyOn(Review, 'countDocuments').mockRejectedValue(new Error('Error'));
            const response = await request(app).get('/api/review').set('Authorization', `Bearer ${defaultAuthToken}`);
            expect(response.status).toBe(500);
        });

    });

    describe('POST /api/review', () => {
        it('should return a Authentication error', async () => {
            // const response = await http.post('/api/review', defaultReview);
            await request(app)
                .post('/api/review')
                .expect(401);
        });

        it('should return Forbidden error', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([]);
            jest.spyOn(User, 'findById').mockResolvedValue(badUser);
            await request(app)
                .post('/api/review')
                .set('Authorization', `Bearer ${badUserAuthToken}`)
                .expect(403);
        });

        it('should return a review', async () => {
            jest.spyOn(Product, 'findById').mockResolvedValue(defaultProduct);
            jest.spyOn(Sequence.Sequence, 'findOneAndUpdate').mockResolvedValue({ seq: 1 });
            jest.spyOn(Review, 'create').mockResolvedValue(defaultReview);

            const response = await request(app)
                .post('/api/review')
                .set('Authorization', `Bearer ${defaultAuthToken}`)
                .send(defaultReview.toObject())
                .expect(201);
            // console.log(response.body);

            expect(response.status).toBe(201);
            expect(response.body.comment).toBe(defaultReview.comment);
            expect(response.body.rating).toBe(defaultReview.rating);
            expect(response.body.target).toBe(defaultReview.target.toString());
            expect(response.body.user).toBe(defaultReview.user.toString());
            expect(response.body.id).toBe(1);

        });

        it('should handle errors', async () => {
            jest.spyOn(Review.prototype, 'save').mockRejectedValue(new Error('Error'));
            await request(app)
                .post('/api/review')
                .set('Authorization', `Bearer ${defaultAuthToken}`)
                .send(defaultReview.toObject())
                .expect(500);

        });


    });
    describe('DELETE /api/review/:id', () => {
        it('should not return 404', async () => {
            await request(app)
                .delete(`/api/review/${defaultReview._id}`)
                .expect(401);
        });

        it('should return unauthorized', async () => {
            await request(app)
                .delete(`/api/review/${defaultReview._id}`)
                .expect(401);
        });

        it('should return forbidden', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([]);
            jest.spyOn(User, 'findOne').mockResolvedValue(badUser);
            await request(app)
                .delete(`/api/review/${defaultReview._id}`)
                .set('Authorization', `Bearer ${badUserAuthToken}`)
                .expect(403);
        });
        it('should return 404 while deleting other user review', async () => {

            jest.spyOn(Review, 'findOne').mockResolvedValue(null);
            await request(app)
                .delete(`/api/review/${defaultReview._id}`)
                .set('Authorization', `Bearer ${defaultAuthToken}`)
                .expect(404);


        });



        it('should return 200 on success', async () => {

            jest.spyOn(Review, 'findOne').mockResolvedValue(defaultReview);
            jest.spyOn(Review, 'deleteOne').mockResolvedValue(defaultReview);
            jest.spyOn(User, 'findById').mockResolvedValue(defaultUser);
            await request(app)
                .delete(`/api/review/${defaultReview._id}`)
                .set('Authorization', `Bearer ${defaultAuthToken}`)
                .expect(200);
        });
        it('should return 200 if admin delete other user review', async () => {
            jest.spyOn(Review, 'findOne').mockResolvedValue({ ...defaultReview.toObject(), user: '507f191e810c19729de860eb' });
            jest.spyOn(Review, 'deleteOne').mockResolvedValue(defaultReview);
            jest.spyOn(Grant, 'find').mockResolvedValue(adminGrants);
            jest.spyOn(User, 'findById').mockResolvedValue(adminUser);
            await request(app)
                .delete(`/api/review/${defaultReview._id}`)
                .set('Authorization', `Bearer ${adminUserAuthToken}`)
                .expect(200);

        });

        it('should return 404 if review not found', async () => {

            jest.spyOn(Review, 'findOne').mockResolvedValue(null);
            await request(app)
                .delete(`/api/review/${defaultReview._id}`)
                .set('Authorization', `Bearer ${defaultAuthToken}`)
                .expect(404);
        });

        it('should return bad request on invalid review id', async () => {

            await request(app)
                .delete(`/api/review/invalid`)
                .set('Authorization', `Bearer ${defaultAuthToken}`)
                .expect(400);
        });

        it('should handle errors', async () => {
            jest.spyOn(Review, 'findOne').mockRejectedValue(new Error('Error'));
            await request(app)
                .delete(`/api/review/${defaultReview._id}`)
                .set('Authorization', `Bearer ${defaultAuthToken}`)
                .expect(500);
        });
    });

});
