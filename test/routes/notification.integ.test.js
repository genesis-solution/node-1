const { connect } = require("../../app/config/database");
const { Grant } = require("../../app/model/Grant");
const User = require("../../app/model/User");
const request = require('supertest');
const app = require('../../app');
const Notification = require("../../app/model/Notification");
require('dotenv').config();


describe('Routes: Notification', () => {
    let connection;

    beforeAll(async () => {
        connection = await connect('test-db-notification');
        await Grant.deleteMany({});
        await User.deleteMany({});
        await Grant.create([
            new Grant({ resource: 'notification', action: 'create', attributes: ['*'], role: 'admin', possession: 'any' }),
            new Grant({ resource: 'notification', action: 'read', attributes: ['*'], role: 'admin', possession: 'any' }),
            new Grant({ resource: 'notification', action: 'update', attributes: ['*'], role: 'admin', possession: 'any' }),
            new Grant({ resource: 'notification', action: 'delete', attributes: ['*'], role: 'admin', possession: 'any' }),

            new Grant({ resource: 'notification', action: 'read', attributes: ['*'], role: 'user', possession: 'own' }),
            new Grant({ resource: 'notification', action: 'update', attributes: ['read'], role: 'user', possession: 'own' }),
            new Grant({ resource: 'notification', action: 'delete', attributes: ['*'], role: 'user', possession: 'own' }),
        ]);
    });
    afterAll(async () => {
        await Grant.deleteMany({});
        await User.deleteMany({});
        await connection.disconnect();
    });

    const user = new User({ role: 'user', disabled: false, verified: true });
    const admin = new User({ role: 'admin', disabled: false, verified: true });

    const userToken = user.generateToken();
    const adminToken = admin.generateToken();


    afterEach(async () => {
        await Notification.deleteMany({});
        jest.restoreAllMocks();
    });



    describe('GET /api/notifications', () => {
        it('should not return 404', async () => {
            const response = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).not.toBe(404);
        });

        it('should return unauthorized', async () => {
            const response = await request(app)
                .get('/api/notifications');
            expect(response.status).toBe(401);
        });

        it('should return an array of own notifications', async () => {
            await Notification.create([
                new Notification({ title: 'title1', body: 'body1', user: user._id, type: 'test' }),
                new Notification({ title: 'title2', body: 'body2', user: user._id, type: 'test' }),
            ]);
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const filter = jest.spyOn(require('accesscontrol/lib/core/Permission').Permission.prototype, 'filter');
            const findNotification = jest.spyOn(Notification, 'find');
            const response = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);
            expect(filter).toHaveBeenCalled();
            expect(response.body.notifications.length).toBe(2);
            expect(findNotification).toHaveBeenCalledWith({ user: user._id });
        });

        it('should return an array of notification with provided user if have readAny permission', async () => {
            await Notification.create([
                new Notification({ title: 'title1', body: 'body1', user: user._id, type: 'test' }),
                new Notification({ title: 'title2', body: 'body2', user: user._id, type: 'test' }),
            ]);
            jest.spyOn(User, 'findById').mockResolvedValue(admin);
            const findNotification = jest.spyOn(Notification, 'find');
            const response = await request(app)
                .get(`/api/notifications?user=${user._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            expect(response.body.notifications.length).toBe(2);
            expect(findNotification).toHaveBeenCalledWith({ user: user._id.toString() });

        });

        it('should return 404 bad request if user id is invalid', async () => {
            jest.spyOn(User, 'findById').mockResolvedValue(admin);
            const response = await request(app)
                .get('/api/notifications?user=invalid')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(400);
        });

        it('should return own notifications if user does not have readAny permission', async () => {
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const findNotification = jest.spyOn(Notification, 'find');
            const response = await request(app)
                .get(`/api/notifications?user=${admin._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);
            expect(response.body.notifications).toEqual([]);
            // console.log({ user: user._id, admin: admin._id });
            expect(findNotification).not.toHaveBeenCalledWith({ user: admin._id });
            expect(findNotification).toHaveBeenCalledWith({ user: user._id });
        });

        it('should return 403 forbidden if user does not have read permission', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([]);
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const response = await request(app)
                .get(`/api/notifications?user=${user._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);
        });

        it('should handle error', async () => {
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            jest.spyOn(Notification, 'countDocuments').mockRejectedValue(new Error('error'));
            const response = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(500);
        });

    });

    describe('PATCH /api/notifications/:id', () => {
        it('should not return 404', async () => {
            const response = await request(app)
                .patch('/api/notifications/1')
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).not.toBe(404);
        });

        it('should return unauthorized', async () => {
            const response = await request(app)
                .patch('/api/notifications/1');
            expect(response.status).toBe(401);
        });

        it('should return 404 not found if notification is not found', async () => {
            jest.spyOn(Notification, 'findOne').mockResolvedValue(null);
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const response = await request(app)
                .patch('/api/notifications/1')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(404);
        });

        it('should return 403 forbidden if user does not have permission', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([]);
            jest.spyOn(Notification, 'findById').mockResolvedValue(new Notification({ user: user._id }));
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const response = await request(app)
                .patch('/api/notifications/1')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);
        });


        it('should return 200 and update notification', async () => {
            const notification = new Notification({ user: user._id, title: 'title', body: 'body', type: 'test' });
            await notification.save();
            jest.spyOn(Notification, 'findOne').mockResolvedValue(notification);
            const findByIdAndUpdateNotification = jest.spyOn(Notification, 'findByIdAndUpdate');
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const filter = jest.spyOn(require('accesscontrol/lib/core/Permission').Permission.prototype, 'filter');
            const response = await request(app)
                .patch(`/api/notifications/${notification._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ read: true })
                .expect(200);
            expect(filter).toHaveBeenCalledWith({ read: true });
            expect(findByIdAndUpdateNotification).toHaveBeenCalledWith(notification._id.toString(), { read: true }, { new: true });
            expect(response.body).toEqual(expect.objectContaining({ read: true }));
        });

        it('should handle error', async () => {
            jest.spyOn(Notification, 'findOne').mockRejectedValue(new Error('error'));
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const response = await request(app)
                .patch('/api/notifications/1')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(500);
        });


    });




});