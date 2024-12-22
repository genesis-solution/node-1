const app = require("../../app");
const { connect } = require("../../app/config/database");
const Banner = require("../../app/model/Banner");
const request = require("supertest");
const User = require("../../app/model/User");
const Grant = require("../../app/model/Grant").Grant;
const fs = require('fs');
const path = require('path');

describe('Routes: Banner', () => {
    let connection;
    let admin;
    let token;
    const image = "test/fixtures/image.jpg";

    beforeAll(async () => {
        connection = await connect('route-banner');
        admin = await User.create({
            name: 'test',
            email: 'test',
            password: 'test',
            role: 'admin',
            verified: true,
            disabled: false,
        });
        token = admin.generateToken();
        await Grant.create([
            new Grant({ role: 'admin', resource: 'banner', action: 'create', possession: 'any', attributes: ['*'] }),
            new Grant({ role: 'admin', resource: 'banner', action: 'delete', possession: 'any', attributes: ['*'] }),
            new Grant({ role: 'admin', resource: 'banner', action: 'update', possession: 'any', attributes: ['*'] }),
            new Grant({ role: 'admin', resource: 'banner', action: 'read', possession: 'any', attributes: ['*'] }),

            new Grant({ role: 'user', resource: 'banner', action: 'create', possession: 'own', attributes: ['*'] }),
            new Grant({ role: 'user', resource: 'banner', action: 'delete', possession: 'own', attributes: ['*'] }),
            new Grant({ role: 'user', resource: 'banner', action: 'update', possession: 'own', attributes: ['*'] }),
            new Grant({ role: 'user', resource: 'banner', action: 'read', possession: 'own', attributes: ['*'] }),
        ]);
    });

    afterAll(async () => {
        await User.deleteMany();
        await Grant.deleteMany();
        await Banner.deleteMany();
        await connection.disconnect();
        fs.rmSync(path.resolve('app/test'), { recursive: true, force: true });
    });

    afterEach(async () => {
        await Banner.deleteMany();
        jest.restoreAllMocks();
    });
    describe('GET /api/banners', () => {
        it('should not return 404 not found', async () => {
            jest.spyOn(Banner, 'find').mockResolvedValue([]);

            const response = await request(app).get('/api/banners');
            expect(response.status).not.toBe(404);

        });
        it('should return all banners', async () => {
            const banners = [
                new Banner({ image: "image1.jpeg" }),
                new Banner({ image: "image2.jpeg" }),
                new Banner({ image: "image3.jpeg" }),
            ];
            jest.spyOn(Banner, 'find').mockResolvedValue(banners);
            const response = await request(app).get('/api/banners');
            expect(response.ok).toBe(true);
            expect(response.body.length).toBe(banners.length);
        });
        it('should handle error', async () => {
            jest.spyOn(Banner, 'find').mockRejectedValue(new Error());
            const response = await request(app).get('/api/banners');
            expect(response.status).toBe(500);
        });
    });
    describe('GET /api/banners/image', () => {

        it('should return a image', async () => {
            let response = await request(app).post('/api/banners')
                .set('Authorization', `Bearer ${token}`)
                .attach('banner[]', image);
            expect(response.ok).toBe(true);
            response = await request(app).get(`/api/banners/image/${response.body[0].image}`);
            expect(response.ok).toBe(true);
        });
    });

    describe('POST /api/banners', () => {
        it('should not return 404', async () => {
            const response = await request(app).post('/api/banners');
            expect(response.status).not.toBe(404);

        });

        it('should upload banner images', async () => {
            const response = await request(app).post('/api/banners')
                .set('Authorization', `Bearer ${token}`)
                .attach('banner[]', image)
                .attach('banner[]', image)
                .attach('banner[]', image)
                .attach('banner[]', image);
            expect(response.status).toBe(201);
            expect(response.body.length).toBe(4);
        });

        it('should handle unexpected error', async () => {
            jest.spyOn(Banner, 'create').mockRejectedValue(new Error());

            const response = await request(app).post('/api/banners')
                .set('Authorization', `Bearer ${token}`)
                .attach('banner[]', image)
                .attach('banner[]', image)
                .attach('banner[]', image)
                .attach('banner[]', image);
            expect(response.status).toBe(500);
        });

        it('should not upload if user is not authenticate', async () => {
            const response = await request(app).post('/api/banners')
                .attach('banner[]', image)
                .attach('banner[]', image)
                .attach('banner[]', image)
                .attach('banner[]', image);
            expect(response.status).toBe(401);
        });
        it('should not upload if user is unauthorized', async () => {
            const user = new User({ role: 'user', verified: true, disabled: false });
            const token = user.generateToken();
            const findUser = jest.spyOn(User, 'findById').mockResolvedValue(user);
            const response = await request(app).post('/api/banners')
                .set('Authorization', `Bearer ${token}`);
            expect(findUser).toHaveBeenCalled();
            expect(response.status).toBe(403);
        });

    });

    describe('DELETE /api/banners', () => {
        it('should not return 404', async () => {
            const response = await request(app).delete('/api/banners/123456789012345678901234');
            expect(response.status).not.toBe(404);
        });
        it('should delete banner', async () => {
            const banner = await Banner.create({ image: 'banner.jpeg' });
            const response = await request(app).delete(`/api/banners/${banner._id}`).set('Authorization', `Bearer ${token}`);
            const deletedBanner = await Banner.findById(banner._id);
            expect(response.status).toBe(200);
            expect(deletedBanner).toBeNull();
        });

        it('should return 400 on bad id', async () => {
            const response = await request(app).delete(`/api/banners/invalid`).set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(400);
        });
        it('should return 404 if banner not found', async () => {
            const banner = new Banner();
            const response = await request(app).delete(`/api/banners/${banner._id}`).set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(404);
        });

        it('should handle unexpected error', async () => {
            jest.spyOn(Banner, 'findByIdAndDelete').mockRejectedValue('error');
            const response = await request(app).delete(`/api/banners/invalid`).set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(500);
        });

        it('should not delete if user is not authenticated ', async () => {
            const response = await request(app).delete(`/api/banners/invalid`);
            expect(response.status).toBe(401);
        });
        it('should not delete if user is unauthorized ', async () => {
            const user = new User({ role: 'user', verified: true, disabled: false });
            const token = user.generateToken();
            const findUser = jest.spyOn(User, 'findById').mockResolvedValue(user);
            const response = await request(app).delete(`/api/banners/invalid`)
                .set('Authorization', `Bearer ${token}`);

            expect(findUser).toHaveBeenCalled();
            expect(response.status).toBe(403);
        });
    });

});