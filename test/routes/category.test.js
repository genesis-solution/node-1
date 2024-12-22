const Category = require('../../app/model/Category');
const User = require('../../app/model/User');
const Sequence = require('../../app/model/Sequence').Sequence;
const request = require('supertest');
const app = require('../../app');
const mockingoose = require('mockingoose');
const { generateJwtToken } = require('../../app/utils/jwt');
const timekeeper = require('timekeeper');
const { Grant } = require('../../app/model/Grant');
const debug = require('debug')('app:test:routes:category');




describe('Routes: Category', () => {
    beforeAll(() => {
        timekeeper.freeze(new Date('2021-01-01T00:00:00.000Z'));
    });
    afterAll(() => {
        timekeeper.reset();
    });
    const admin = new User({ verified: true, disabled: false, role: 'admin' });
    const user = new User({ verified: true, disabled: false });

    beforeEach(() => {
        mockingoose.resetAll();
        mockingoose(Grant).toReturn([
            new Grant({ role: 'admin', resource: 'category', action: 'create:any', attributes: ['*'] }),
            new Grant({ role: 'admin', resource: 'category', action: 'read:any', attributes: ['*'] }),
            new Grant({ role: 'admin', resource: 'category', action: 'update:any', attributes: ['*'] }),
            new Grant({ role: 'admin', resource: 'category', action: 'delete:any', attributes: ['*'] }),
        ], 'find');
    });

    describe('GET /api/category', () => {
        it('should return a list of grouped categories', async () => {
            const subCategory = {
                _id: '507f191e810c19729de860eb',
                name: 'Category 2',
                image: 'image.jpg',
                parent: '507f191e810c19729de860ea',
                categories: []
            };
            const parent = {
                _id: '507f191e810c19729de860ea',
                name: 'Category 1',
                image: 'image.jpg',
                parent: null,
                categories: [
                    subCategory
                ]
            };
            mockingoose(Category).toReturn(subCategory, 'findOne');
            mockingoose(Category).toReturn([parent], 'find');
            const response = await request(app).get('/api/category');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.arrayContaining([parent]));
        });
        it('should handle errors', async () => {
            mockingoose(Category).toReturn(new Error('Error'), 'find');
            const response = await request(app).get('/api/category');
            expect(response.status).toBe(500);
        });

        it('should return an empty array', async () => {
            mockingoose(Category).toReturn([], 'find');
            const response = await request(app).get('/api/category');
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it('should return a single category', async () => {
            const _doc = {
                _id: '507f191e810c19729de860ea',
                name: 'Category 1',
                image: 'image.jpg'
            };
            mockingoose(Category).toReturn(_doc, 'findOne');
            const response = await request(app).get('/api/category/507f191e810c19729de860ea');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.objectContaining(_doc));
        });

        it('should handle errors for single', async () => {
            mockingoose(Category).toReturn(new Error('Error'), 'findOne');
            const response = await request(app).get('/api/category/507f191e810c19729de860ea');
            expect(response.status).toBe(500);
        });

        it('should return 404 for not found', async () => {
            mockingoose(Category).toReturn(null, 'findOne');
            const response = await request(app).get('/api/category/507f191e810c19729de860ea');
            expect(response.status).toBe(404);
        });
    });



    describe('POST /api/category', () => {
        const token = admin.generateToken();
        const image = "test/fixtures/image.jpg";

        it('should handle unauthorized', async () => {
            mockingoose(User).toReturn(null, 'findOne');
            const response = await request(app).post('/api/category').send({});
            expect(response.status).toBe(401);
        });

        it('should handle forbidden on invalid permission', async () => {
            mockingoose(Grant).toReturn([], 'find');
            const token = user.generateToken();
            mockingoose(User).toReturn(user, 'findOne');
            const response = await request(app).post('/api/category').set('Authorization', `Bearer ${token}`).send({});
            expect(response.status).toBe(403);
        });

        it('should create a new category', async () => {
            const doc = {
                id: 1,
                name: 'Category 1',
                image: `image.jpg`
            };
            mockingoose(User).toReturn(admin, 'findOne');
            mockingoose(Sequence).toReturn({ seq: 1 }, 'findOneAndUpdate');
            mockingoose(Category).toReturn(doc, 'save');

            const response = await request(app)
                .post('/api/category')
                .set('Authorization', `Bearer ${token}`)
                .field('name', 'Category 1')
                .attach('image', image);

            debug(response.body);
            expect(response.status).toBe(201);
            expect(response.body.name).toBe('Category 1');
            expect(response.body.image).toEqual(expect.stringContaining(doc.image));

        });
        it('should create a new category with banner', async () => {
            const doc = {
                id: 1,
                name: 'Category 1',
                image: `image.jpg`,
                banner: `image.jpg`,
            };
            mockingoose(User).toReturn(admin, 'findOne');
            mockingoose(Sequence).toReturn({ seq: 1 }, 'findOneAndUpdate');
            mockingoose(Category).toReturn(doc, 'save');

            const response = await request(app)
                .post('/api/category')
                .set('Authorization', `Bearer ${token}`)
                .field('name', 'Category 1')
                .attach('image', image)
                .attach('banner', image);

            expect(response.status).toBe(201);
            expect(response.body.name).toBe('Category 1');
            expect(response.body.image).toEqual(expect.stringContaining(doc.image));
            expect(response.body.banner).toEqual(expect.stringContaining(doc.banner));

        });

        it('should handle errors', async () => {
            mockingoose(Sequence).toReturn({ seq: 1 }, 'findOneAndUpdate');
            mockingoose(User).toReturn(admin, 'findOne');
            jest.spyOn(Category, 'create').mockRejectedValue(new Error());

            const _doc = {
                _id: '507f191e810c19729de860ea',
                name: 'Category 1',
            };

            const response = await request(app).post('/api/category')
                .set('Authorization', `Bearer ${token}`)
                .field('name', 'Category 1')
                .attach('image', image);
            expect(response.status).toBe(500);
        });

        it('should handle validation errors', async () => {
            mockingoose(Sequence).toReturn({ seq: 1 }, 'findOneAndUpdate');
            mockingoose(User).toReturn(admin, 'findOne');
            const response = await request(app).post('/api/category')
                .set('Authorization', `Bearer ${token}`)
                .send({});
            expect(response.status).toBe(400);
        });

        it('should handle missing name', async () => {
            mockingoose(Sequence).toReturn({ seq: 1 }, 'findOneAndUpdate');
            mockingoose(User).toReturn(admin, 'findOne');
            const _doc = {
                _id: '507f191e810c19729de860ea',
                image: 'image.jpg'
            };
            const response = await request(app).post('/api/category')
                .set('Authorization', `Bearer ${token}`)
                .attach('image', image);
            expect(response.status).toBe(400);
        });

        it('should handel missing image', async () => {
            mockingoose(User).toReturn(admin, 'findOne');

            const _doc = {
                _id: '507f191e810c19729de860ea',
                name: 'Category 1'
            };
            const response = await request(app)
                .post('/api/category')
                .set('Authorization', `Bearer ${token}`)
                .field('name', 'Category 1');
            expect(response.status).toBe(400);
        });

    });

    describe('DELETE /api/category/:id', () => {


        it('should handle unauthorized', async () => {
            const response = await request(app).delete('/api/category/507f191e810c19729de860ea');
            expect(response.status).toBe(401);
        });

        it('should handle forbidden on invalid permission', async () => {
            mockingoose(Grant).toReturn([], 'find');
            const token = user.generateToken();
            mockingoose(User).toReturn(user, 'findOne');
            const response = await request(app).delete('/api/category/507f191e810c19729de860ea').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(403);
        });

        it('should handle errors', async () => {
            const token = user.generateToken();
            mockingoose(User).toReturn(user, 'findOne');
            mockingoose(Category).toReturn(new Error('Error'), 'findOneAndDelete');
            const response = await request(app).delete('/api/category/507f191e810c19729de860ea').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(500);
        });
    });

    afterAll(() => {
        const multer = require('../../app/config/multer');
        const fs = require('fs');
        if (!multer.BASE_DIR_PATH.includes('test')) return debug('Not deleting the test directory');
        fs.rmSync(`${multer.BASE_DIR_PATH}/`, { recursive: true, force: true });
        debug('Deleted the test directory');
    });
});