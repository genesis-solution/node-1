const Notification = require('../../app/model/Notification');
const User = require('../../app/model/User');

describe('Notification', () => {
    let connection;

    beforeAll(async () => {
        connection = await require('../../app/config/database').connect('test-db-notification');
    });

    afterAll(async () => {
        await connection.disconnect();
    });

    it('should create a new notification', async () => {
        const user = new User({});
        const notification = await Notification.create({
            title: 'Test Notification',
            body: 'This is a test notification',
            user: user._id,
            read: undefined,
            type: 'Support',
            reference: /* objectId */ '5f5f5f5f5f5f5f5f5f5f5f5f'
        });

        const fountNotification = await Notification.findById(notification._id);
        expect(fountNotification.title).toBe('Test Notification');
        expect(fountNotification.body).toBe('This is a test notification');
        expect(fountNotification.user).toEqual(user._id);
        expect(fountNotification.read).toBe(false);
        expect(fountNotification.type).toBe('Support');
        expect(fountNotification.reference).toStrictEqual(notification.reference);

    });
});