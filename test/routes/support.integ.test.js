const app = require("../../app");
const request = require("supertest");
const User = require("../../app/model/User");
const { connect } = require("../../app/config/database");
const Support = require("../../app/model/Support");
const { seedGrants } = require("../../app/seed");
const { Grant } = require("../../app/model/Grant");

describe('Routes: Support', () => {
    let connection;
    const owner = new User({ disabled: false, verified: true, role: 'owner' });
    const user = new User({ disabled: false, verified: true, role: 'user' });

    const ownerToken = owner.generateToken();
    const userToken = user.generateToken();

    const screenshot = "test/fixtures/image.jpg";



    beforeAll(async () => {
        connection = await connect('test-support');
        await seedGrants(); //NOTE: This is a function from app/seed.js
    });

    afterAll(async () => {
        await Grant.deleteMany();
        await connection.disconnect();
    });

    afterEach(async () => {
        jest.restoreAllMocks();
        await Support.deleteMany();
    });



    describe('POST /api/support', () => {
        it('should not return 404', async () => {
            const response = await request(app)
                .post('/api/support');
            expect(response.status).not.toEqual(404);
        });

        it('should return unauthorized if no token is provided', async () => {
            const response = await request(app)
                .post('/api/support');
            expect(response.status).toEqual(401);
        });

        describe('have createOwn permission', () => {
            it('should create a support case', async () => {
                jest.spyOn(User, 'findById').mockResolvedValue(user);
                const createSupport = jest.spyOn(Support, 'create');
                const response = await request(app)
                    .post('/api/support')
                    .set('Authorization', `Bearer ${userToken}`)
                    .attach('screenshots[]', screenshot)
                    .attach('screenshots[]', screenshot)
                    .field('title', 'Test Support')
                    .field('description', 'Test Support Description')
                    .field('reference', 'Test Support Reference')
                    .field('type', 'other')
                    .field('status', 'Test Support Status')
                    .field('priority', 'Test Support Priority')
                    .field('email', 'test@test.com')
                    .field('user', new User()._id.toString());

                expect(response.status).toEqual(201);
                expect(createSupport).toHaveBeenCalledWith({
                    title: 'Test Support',
                    description: 'Test Support Description',
                    reference: 'Test Support Reference',
                    type: 'other',
                    screenshots: [expect.any(String), expect.any(String)],
                    user: user._id,
                    email: 'test@test.com'
                });
                createSupport.mockRestore();


            });
        });

        describe('have createAny permission', () => {
            it('should create a support case', async () => {
                jest.spyOn(User, 'findById').mockResolvedValue(owner);
                const createSupport = jest.spyOn(Support, 'create');
                const response = await request(app)
                    .post('/api/support')
                    .set('Authorization', `Bearer ${ownerToken}`)
                    .attach('screenshots[]', screenshot)
                    .attach('screenshots[]', screenshot)
                    .field('title', 'Test Support')
                    .field('description', 'Test Support Description')
                    .field('reference', 'Test Support Reference')
                    .field('type', 'other')
                    .field('status', 'in_progress')
                    .field('priority', 'medium')
                    .field('email', 'test@test.com')
                    .field('user', user._id.toString());

                expect(response.status).toEqual(201);
                expect(createSupport).toHaveBeenCalledWith({
                    title: 'Test Support',
                    description: 'Test Support Description',
                    reference: 'Test Support Reference',
                    type: 'other',
                    status: 'in_progress',
                    priority: 'medium',
                    screenshots: [expect.any(String), expect.any(String)],
                    email: 'test@test.com',
                    user: user._id.toString(),
                });
            });


        });

        it('should handle errors', async () => {
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const createSupport = jest.spyOn(Support, 'create').mockRejectedValue(new Error('Test Error'));
            const response = await request(app)
                .post('/api/support')
                .set('Authorization', `Bearer ${userToken}`)
                .attach('screenshots[]', screenshot)
                .attach('screenshots[]', screenshot)
                .field('title', 'Test Support')
                .field('description', 'Test Support Description')
                .field('reference', 'Test Support Reference')
                .field('type', 'other')
                .field('status', 'Test Support Status')
                .field('priority', 'Test Support Priority')
                .field('email', 'test@test.com')
                .field('user', new User()._id.toString());

            expect(response.status).toEqual(500);

            createSupport.mockRestore();


        });


    });

    //TODO: Add test for PATCH /api/support/:id
    describe.skip('PATCH /api/support/:id', () => {
        it('should not return 404', async () => {
            const response = await request(app)
                .patch('/api/support/123');
            expect(response.status).not.toEqual(404);
        });
    });
});




