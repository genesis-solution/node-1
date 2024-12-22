const bettersupertest = require('../fixtures/bettersupertest');
const request = require('supertest');
const timekeeper = require('timekeeper');
const app = require('../../app');
const Amenity = require('../../app/model/Amenity');
const { http, server } = bettersupertest(app);
const database = require('../../app/config/database');
const { Sequence } = require('../../app/model/Sequence');
const User = require('../../app/model/User');
const { Grant } = require('../../app/model/Grant');
const path = require('path');
const fs = require('fs');
const multer = require('../../app/config/multer');
const random = require('../../app/service/random');

afterAll(() => {
    server.close();
});

describe('Routes: Amenity', () => {
    let connection;
    beforeAll(async () => {
        connection = await database.connect('test_ame_route');

        await Promise.all([
            Amenity.deleteMany(),
            Sequence.deleteMany()
        ]);
        await Grant.create([
            new Grant({ role: 'admin', resource: 'amenity', action: 'create', possession: 'any', attributes: ['*'] }),
            new Grant({ role: 'admin', resource: 'amenity', action: 'read', possession: 'any', attributes: ['*'] }),
            new Grant({ role: 'admin', resource: 'amenity', action: 'update', possession: 'any', attributes: ['*'] }),
            new Grant({ role: 'admin', resource: 'amenity', action: 'delete', possession: 'any', attributes: ['*'] }),
        ]);
    });
    afterAll(async () => {
        await Promise.all([
            await Amenity.deleteMany(),
            await Sequence.deleteMany(),
            await User.deleteMany(),
            await Grant.deleteMany(),
        ]);
        await connection.disconnect();
        fs.rmSync(path.resolve('app/test'), { recursive: true, force: true });
    });
    afterEach(async () => {
        await Promise.all([
            Amenity.deleteMany(),
            Sequence.deleteMany(),
            User.deleteMany(),
        ]);
        jest.restoreAllMocks();
    });
    beforeEach(() => {
        jest.spyOn(random, 'randomHex').mockReturnValue('test');
    });
    describe('GET /api/amenities', () => {
        it('should return a list of amenities', async () => {
            const response = await http.get('/api/amenities');
            expect(response.status).toBe(200);
            expect(response.data).toEqual(expect.arrayContaining([]));
        });
    });
    describe('POST /api/amenities', () => {
        let token;
        beforeEach(async () => {
            const user = await User.create({ name: "User 1", email: "test@test.com", password: "test", role: "admin", verified: true, disabled: false, });
            token = user.generateToken();
        });


        it('should create a new Amenity', async () => {
            const now = Date.now();
            const image = "test/fixtures/image.jpg";

            const doc = {
                name: 'Amenity 1',
                image: `amenity/test-image.jpg`,
            };
            const createAmenity = jest.spyOn(Amenity, 'create');

            const response = await request(app)
                .post('/api/amenities')
                .set('Authorization', `Bearer ${token}`)
                .set('Accept', '*/*')
                .field('name', 'Amenity 1')
                .attach('image', image);
            expect(response.status).toBe(201);
            expect(createAmenity).toHaveBeenCalledWith(doc);

            expect(response.body.name).toBe('Amenity 1');
            expect(response.body.image).toBe(doc.image);

        });
        it('should return 401 on bad authentication', async () => {
            const response = await request(app)
                .post('/api/amenities');
            expect(response.status).toBe(401);
        });

        it('should return 403 on unauthorized access', async () => {
            const user = new User({ role: 'user', verified: true, disabled: false });
            const token = user.generateToken();
            const findUser = jest.spyOn(User, 'findById').mockResolvedValue(user);
            const response = await request(app)
                .post('/api/amenities')
                .set('Authorization', `Bearer ${token}`);
            expect(findUser).toHaveBeenCalled();
            expect(response.status).toBe(403);
        });
    });
    describe('GET /api/amenities/image/:image', () => {
        it('should return a image', async () => {
            const now = Date.now();
            const image = "test/fixtures/image.jpg";
            // copy file to multer directory
            const directory = path.resolve(multer.BASE_DIR_PATH, 'amenity');
            // create directory if not exists
            fs.mkdirSync(directory, { recursive: true });
            const imagePath = `${now}-image.jpg`;

            fs.copyFileSync(image, path.resolve(directory, imagePath));
            const amenity = await Amenity.create({ name: "Amenity 1", image: imagePath });
            const response = await http.get(`/api/amenities/image/${imagePath}`);
            console.log(response.headers.get('content-type'));
            expect(response.headers.get('content-type')).toBe('image/jpeg');
            expect(response.status).toBe(200);
        });

        it('should return 404 on invalid image', async () => {
            const response = await http.get(`/api/amenities/image/invalid`);
            expect(response.headers.get('content-type')).not.toBe('image/jpeg');
        });
    });

    describe('DELETE /api/amenities/:id', () => {
        let token;
        beforeEach(async () => {
            const user = await User.create({ name: "User 1", email: "test@test.com", password: "test", role: "admin", verified: true, disabled: false, });
            token = user.generateToken();
        });

        it('should delete a amenity', async () => {


            const amenity = await Amenity.create({ name: "Amenity 1", image: "test.jpg" });
            const response = await http.delete(`/api/amenities/${amenity._id}`, { headers: { authorization: `Bearer ${token}` } });
            expect(response.status).toBe(200);
        });

        it('should handle invalid id', async () => {
            const response = await http.delete(`/api/amenities/invalid`, { headers: { authorization: `Bearer ${token}` } });
            expect(response.status).toBe(404);
        });

        it('should return 401 on bad authentication', async () => {
            const response = await http.delete(`/api/amenities/invalid`);
            expect(response.status).toBe(401);
        });
        it('should return 403 on unauthorized access', async () => {
            const user = new User({ role: 'user', verified: true, disabled: false });
            const token = user.generateToken();
            const findUser = jest.spyOn(User, 'findById').mockResolvedValue(user);
            const response = await http.delete(`/api/amenities/invalid`, { headers: { authorization: `Bearer ${token}` } });
            expect(findUser).toHaveBeenCalled();
            expect(response.status).toBe(403);
        });



    });
});