const User = require("../../app/model/User");
const bcrypt = require('bcrypt');
const database = require('../../app/config/database');
const mongoose = require('mongoose');
require('dotenv').config();



describe('User integration', () => {
    beforeAll(async () => {
        await database.connect('grocery-test');
        await User.deleteMany({});
    });
    afterEach(async () => {
        await User.deleteMany({});
    });
    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should create a new user', async () => {
        const _doc = {
            name: 'John Doe',
            email: 'test@user.com',
            password: 'password',
            role: 'user',
            profilePic: 'test.jpg',
        };
        const user = new User(_doc);

        await user.save();

        const foundUser = await User.findOne({ email: _doc.email });
        expect(foundUser).toBeTruthy();
        expect(foundUser.email).toBe(_doc.email);
        expect(foundUser.name).toBe(_doc.name);
        expect(foundUser.password).not.toBe(_doc.password);
        expect(foundUser.role).toBe(_doc.role);
        expect(foundUser.profilePic).toBe(_doc.profilePic);
        
        expect(foundUser.twoFactorAuthEnabled).toBe(false);
        expect(foundUser.verified).toBe(false); // email is not verified
        expect(foundUser.disabled).toBe(false); // account is not disabled
        
        expect(foundUser.createdAt).toBeDefined();
        expect(foundUser.updatedAt).toBeDefined();

    });

    it('should contain properties _id, name, email, password, role, profilePic, ...', async () => {
        const _doc = {
            name: 'John Doe',
            email: 'test@test.com',
            password: 'password',
            role: 'user',
            profilePic: 'test.jpg',
        };
        const user = new User(_doc);
        await user.save();
        const foundUser = await User
            .findOne({ email: _doc.email });
        expect(foundUser).toHaveProperty('_id');
        expect(foundUser).toHaveProperty('name');
        expect(foundUser).toHaveProperty('email');
        expect(foundUser).toHaveProperty('password');
        expect(foundUser).toHaveProperty('role');
        expect(foundUser).toHaveProperty('profilePic');
        expect(foundUser).toHaveProperty('id');
        expect(foundUser).toHaveProperty('twoFactorAuthEnabled');
        
        expect(foundUser).toHaveProperty('createdAt');
        expect(foundUser).toHaveProperty('updatedAt');

    });

    it('should hash the password on save()', async () => {
        const email = "test@user.com";
        const password = 'password';
        const bcryptPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name: 'John Doe',
            email: email,
            password: password,
            role: 'user',
        });

        await user.save();
        const foundUser = await User.findOne({ email });
        expect(foundUser).toBeTruthy();
        expect(foundUser.password).not.toBe(password);
        expect(await bcrypt.compare(password, foundUser.password)).toBe(true);
    });

});


