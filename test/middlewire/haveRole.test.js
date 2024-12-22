require('dotenv').config();
const haveRole = require('../../app/middlewire/haveRole');
const request = require('supertest');
const express = require('express');
const mockingoose = require('mockingoose');
const { generateJwtToken } = require('../../app/utils/jwt');
const app = express();
require('../../app/config/passport')(app);
const User = require('../../app/model/User');


describe('haveRole middlewire', () => {
    const user = new User({ role: 'user', disabled: false, verified: true });
    const admin = new User({ id: 1, role: 'admin', disabled: false, verified: true });



    it('should return 403 if the user does not have the required role', async () => {
        app.get('/test', haveRole('admin'), (req, res) => {
            res.send('ok');
        });
        mockingoose(User).toReturn(user, 'findOne');
        const token = user.generateToken()

        const response = await request(app)
            .get('/test')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(403);
    });

    it('should return 200 if the user has the required role', async () => {
        app.get('/test', haveRole('admin'), (req, res) => {
            res.send('ok');
        });
        mockingoose(User).toReturn(admin, 'findOne');
        const token = admin.generateToken()
        const response = await request(app)
            .get('/test')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
    });

    it('should return 401 if the user is not authenticated', async () => {
        app.get('/test', haveRole('admin'), (req, res) => {
            res.send('ok');
        });
        const response = await request(app)
            .get('/test');
        expect(response.status).toBe(401);
    });



    // remove '/test route aftereach
    afterEach(() => {
        app._router.stack.pop();
    });
});