require('dotenv').config();
const havePermission = require('../../app/middlewire/havePermission');
const supertest = require('supertest');
const express = require('express');
const mockingoose = require('mockingoose');

const { generateJwtToken } = require('../../app/utils/jwt');
const app = express();
require('../../app/config/passport')(app);
const User = require('../../app/model/User');
const Grant = require('../../app/model/Grant').Grant;
const { Query } = require('accesscontrol');

describe('havePermission middlewire', () => {
    const user = { id: 1, role: 'user', verified: true, disabled: false };
    const admin = { id: 1, role: 'admin' };

    afterAll(() => {
        mockingoose.resetAll();
    });

    it('should return 403 if the user does not have the required permission', async () => {
        mockingoose(Grant).toReturn([new Grant({
            action: 'create',
            possession: 'own',
            resource: 'user',
            role: 'user',
            attributes: ['*'],
        })], 'find');

        app.get('/test', havePermission('user', ['createAny']), (req, res) => {
            res.send('ok');
        });
        mockingoose(User).toReturn(user, 'findOne');
        const token = generateJwtToken(user);

        const response = await supertest(app)
            .get('/test')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(403);
    });

    it('should return 200 if the user has the required permission', async () => {
        mockingoose(Grant).toReturn([new Grant({
            action: 'create',
            possession: 'own',
            resource: 'user',
            role: 'user',
            attributes: ['*'],
        })], 'find');

        app.get('/test', havePermission('user', ['createOwn']), (req, res) => {
            res.send('ok');
        });
        mockingoose(User).toReturn(user, 'findOne');
        const token = generateJwtToken(user);

        const response = await supertest(app)
            .get('/test')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
    });

    it('should return 401 if the user is disabled', async () => {
        mockingoose(Grant).toReturn([new Grant({
            action: 'create',
            possession: 'own',
            resource: 'user',
            role: 'user',
            attributes: ['*'],
        })], 'find');

        app.get('/test', havePermission('user', ['createOwn']), (req, res) => {
            res.send('ok');
        });
        mockingoose(User).toReturn({ ...user, disabled: true }, 'findOne');
        const token = generateJwtToken(user);

        const response = await supertest(app)
            .get('/test')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(401);
    });

    it('should return 401 if the user is not verified', async () => {
        mockingoose(Grant).toReturn([new Grant({
            action: 'create',
            possession: 'own',
            resource: 'user',
            role: 'user',
            attributes: ['*'],
        })], 'find');

        app.get('/test', havePermission('user', ['createOwn']), (req, res) => {
            res.send('ok');
        });
        mockingoose(User).toReturn({ ...user, verified: false }, 'findOne');
        const token = generateJwtToken(user);

        const response = await supertest(app)
            .get('/test')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(401);
    });

    it('should return 401 if the user is not authenticated', async () => {
        app.get('/test', havePermission('user', ['createAny']), (req, res) => {
            res.send('ok');
        });

        const response = await supertest(app)
            .get('/test');

        expect(response.status).toBe(401);
    });

    it('should return 200 if the user is not authenticated and allowAnonymous is true', async () => {
        mockingoose(Grant).toReturn([new Grant({
            action: 'read',
            possession: 'any',
            resource: 'user',
            role: 'user',
            attributes: ['*'],
        })], 'find');

        app.get('/test', havePermission('user', ['readAny'], true), (req, res) => {
            expect(req.user).toBeDefined();
            expect(req.user.role).toBe('anonymous');
            res.send('ok');
        });
        await supertest(app).get('/test').expect(200);
    });

    it('should return 500 on invalid permission', async () => {
        mockingoose(Grant).toReturn([new Grant({
            action: 'create',
            possession: 'own',
            resource: 'user',
            role: 'user',
            attributes: ['*'],
        })], 'find');

        app.get('/test', havePermission('user', ['invalid']), (req, res) => {
            res.send('ok');
        });
        mockingoose(User).toReturn(user, 'findOne');
        const token = generateJwtToken(user);

        const response = await supertest(app)
            .get('/test')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(500);
    });

    it('should return 403 on AccessControlError', async () => {
        mockingoose(Grant).toReturn([new Grant({
            action: 'test',
            resource: 'user',
            role: 'user',
            attributes: ['*'],
        })], 'find');
        app.get('/test', havePermission('user', ['createOwn']), (req, res) => {
            res.send('ok');
        });
        const findOneUser = jest.spyOn(User, 'findById').mockResolvedValue(new User({ ...user }));
        const token = generateJwtToken(user);

        const response = await supertest(app)
            .get('/test')
            .set('Authorization', `Bearer ${token}`);
        expect(findOneUser).toHaveBeenCalled();

        expect(response.status).toBe(403);
    });

    it('should add res.locals.ac and req.user', async () => {
        mockingoose(Grant).toReturn([new Grant({
            action: 'create',
            possession: 'own',
            resource: 'user',
            role: 'user',
            attributes: ['*'],
        })], 'find');


        app.get('/test', havePermission('user', ['createOwn']), (req, res) => {
            expect(res.locals.ac).toBeDefined();
            // expect(res.locals.ac).toBeInstanceOf(Query);
            expect(req.user).toBeDefined();
            res.send('ok');
        });
        const findOneUser = jest.spyOn(User, 'findById').mockResolvedValue(new User({ ...user }));

        const token = generateJwtToken(user);

        const response = await supertest(app)
            .get('/test')
            .set('Authorization', `Bearer ${token}`);
        expect(findOneUser).toHaveBeenCalled();
        findOneUser.mockRestore();
        expect(response.status).toBe(200);

    });

    it('should throw TypeError if the resource is not predefined or unknown resource', async () => {
        expect(() => {
            havePermission('unknown', ['createOwn']);
        }).toThrow(TypeError);
    });

    // remove '/test route aftereach
    afterEach(() => {
        app._router.stack.pop();
    });
});