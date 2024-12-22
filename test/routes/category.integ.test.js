const bettersupertest = require('../fixtures/bettersupertest');
const request = require('supertest');
const timekeeper = require('timekeeper');
const app = require('../../app');
const Category = require('../../app/model/Category');
const { http, server } = bettersupertest(app);
const database = require('../../app/config/database');
const { Sequence } = require('../../app/model/Sequence');
const User = require('../../app/model/User');
const { Grant } = require('../../app/model/Grant');
const path = require('path');
const fs = require('fs');
const multer = require('../../app/config/multer');

afterAll(() => {
    server.close();
});

describe('Routes: Category', () => {
    let connection;
    beforeAll(async () => {
        connection = await database.connect('test_cat_route');

        await Promise.all([
            Category.deleteMany(),
            Sequence.deleteMany()
        ]);
        await Grant.create([
            new Grant({ role: 'admin', resource: 'category', action: 'create', possession: 'any', attributes: ['*'] }),
            new Grant({ role: 'admin', resource: 'category', action: 'read', possession: 'any', attributes: ['*'] }),
            new Grant({ role: 'admin', resource: 'category', action: 'update', possession: 'any', attributes: ['*'] }),
            new Grant({ role: 'admin', resource: 'category', action: 'delete', possession: 'any', attributes: ['*'] }),
        ]);
    });
    afterAll(async () => {
        await Promise.all([
            await Category.deleteMany(),
            await Sequence.deleteMany(),
            await User.deleteMany(),
            await Grant.deleteMany(),
        ]);

        await connection.disconnect();
    });
    afterEach(async () => {
        await Promise.all([
            Category.deleteMany(),
            Sequence.deleteMany(),
            User.deleteMany(),
        ]);
    });
    describe('GET /api/category', () => {
        it('should return a list of categories', async () => {
            const response = await http.get('/api/category');
            expect(response.status).toBe(200);
            expect(response.data).toEqual(expect.arrayContaining([]));
        });
    });
    describe('POST /api/category', () => {
        beforeEach(async () => {
            await User.create({ name: "User 1", email: "test@test.com", password: "test", role: "admin", verified: true, disabled: false, });
        });
        beforeAll(() => {
            timekeeper.freeze();
        });
        afterAll(() => timekeeper.reset());

        it('should create a new category', async () => {
            const user = await User.findOne();
            const token = user.generateToken();
            const now = Date.now();
            const image = "test/fixtures/image.jpg";
            const banner = "test/fixtures/banner.jpg";

            const doc = {
                name: 'Category 1',
                image: expect.stringContaining(`image.jpg`),
                banner: expect.stringContaining(`image.jpg`),
            };
            const createCategory = jest.spyOn(Category, 'create');

            const response = await request(app)
                .post('/api/category')
                .set('Authorization', `Bearer ${token}`)
                .set('Accept', '*/*')
                .field('name', 'Category 1')
                .attach('image', image)
                .attach('banner', image);
            expect(response.status).toBe(201);
            expect(createCategory).toHaveBeenCalledWith(doc);

            expect(response.body.name).toBe('Category 1');
            expect(response.body.image).toEqual(doc.image);

        });
    });

    describe('GET /api/category/image/:image', () => {
        it('should return a image', async () => {
            
            const now = Date.now();
            const image = "test/fixtures/image.jpg";
            // copy file to multer directory
            const directory = path.resolve(multer.BASE_DIR_PATH, 'category');
            // create directory if not exists
            fs.mkdirSync(directory, { recursive: true });
            const imagePath = `${now}-image.jpg`;

            fs.copyFileSync(image, path.resolve(directory, imagePath));
            const category = await Category.create({ name: "Category 1", image: imagePath, banner: imagePath});
            const response = await http.get(`/api/category/image/${imagePath}`);
            console.log(response.headers.get('content-type'));
            expect(response.headers.get('content-type')).toBe('image/jpeg');
            expect(response.status).toBe(200);
        });

        it('should return 404 on invalid image', async () => {
            const response = await http.get(`/api/category/image/invalid`);
            expect(response.headers.get('content-type')).not.toBe('image/jpeg');
        });
    });

    describe('DELETE /api/category/:id', () => {
        beforeEach(async () => {
            await User.create({ name: "User 1", email: "test@test.com", password: "test", role: "admin", verified: true, disabled: false, });
        });

        it('should delete a category', async () => {
            const user = await User.findOne();
            const token = user.generateToken();
            const category = await Category.create({ name: "Category 1", image: "test.jpg" });
            const response = await http.delete(`/api/category/${category._id}`, { headers: { authorization: `Bearer ${token}` } });
            expect(response.status).toBe(200);
        });

        it('should handle invalid id', async () => {
            const user = await User.findOne();
            const token = user.generateToken();
            const response = await http.delete(`/api/category/invalid`, { headers: { authorization: `Bearer ${token}` } });
            expect(response.status).toBe(404);
        });


    });
});