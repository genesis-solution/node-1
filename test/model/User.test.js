const bcrypt = require('bcrypt');
const mockingoose = require('mockingoose');
const User = require('../../app/model/User');
const debug = require('debug')('app:test:model:user');
const jwt = require('jsonwebtoken');
const TwoFactorAuthEnabledError = require('../../app/errors/TwoFactorAuthEnabled');
require('dotenv').config();


describe('User model', () => {
    beforeEach(() => {
        mockingoose.resetAll();
    });
    describe('User.authenticate', () => {

        it('should authenticate the user with', async () => {
            const _doc = {
                _id: '507f191e810c19729de860ea',
                name: 'John Doe',
                email: 'test@user.com"',
                password: await bcrypt.hash('password', 10),
                role: 'user',
            };

            mockingoose(User).toReturn(_doc, 'findOne');
            debug(User.authenticate);
            const user = await User.authenticate(_doc.email, 'password');
            expect(user).toBeTruthy();
            expect(user.email).toBe(_doc.email);
        });

        it('should return null on invalid email', async () => {
            mockingoose(User).toReturn(null, 'findOne');
            const user = await User.authenticate('email', 'password');
            expect(user).toBeNull();
        });

        it('should return null on invalid password', async () => {
            const _doc = {
                _id: '507f191e810c19729de860ea',
                name: 'John Doe',
                email: 'test@test.com',
                password: await bcrypt.hash('password', 10),
                role: 'user',
            };
            mockingoose(User).toReturn(_doc, 'findOne');
            const user = await User.authenticate(_doc.email, 'invalid');
            expect(user).toBeNull();
        });
        it('should return null on invalid password type', async () => {
            const _doc = {
                _id: '507f191e810c19729de860ea',
                name: 'John Doe',
                email: 'test@test.com',
                password: await bcrypt.hash('password', 10),
                role: 'user',
            };
            mockingoose(User).toReturn(_doc, 'findOne');
            const user = await User.authenticate(_doc.email, 1234);
            expect(user).toBeNull();
        });

    });

    describe('User.generateToken', () => {
        it('should return a valid token', async () => {
            const _doc = {
                _id: '507f191e810c19729de860ea',
                name: 'John Doe',
                email: 'test@test.com',
                password: await bcrypt.hash('password', 10),
                role: 'user',
            };
            const user = new User(_doc);
            const token = user.generateToken();
            expect(token).toBeTruthy();
            const decoded = await jwt.verify(token, process.env.JWT_SECRET);
            expect(decoded.id).toBe(_doc._id);
            expect(decoded.role).toBe(_doc.role);
        });



    });
});
