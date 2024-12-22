const mongoose = require('mongoose');
const { Grant, resources } = require('../../app/model/Grant');
const { connect } = require('../../app/config/database');

describe('Grant model', () => {
    /** @type {mongoose.Mongoose} */
    let connection;
    beforeAll(async () => {
        connection = await connect('grant-test');
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await Grant.deleteMany({});
    });

    it('should create a new grant', async () => {
        const grantData = {
            role: 'admin',
            resource: resources.cancelation,
            action: 'create',
            possession: 'own',
            attributes: ['attribute1', 'attribute2'],
        };

        const grant = new Grant(grantData);
        const savedGrant = await grant.save();

        expect(savedGrant.role).toBe(grantData.role);
        expect(savedGrant.resource).toBe(grantData.resource);
        expect(savedGrant.action).toBe(grantData.action);
        expect(savedGrant.possession).toBe(grantData.possession);
        expect(savedGrant.attributes).toEqual(grantData.attributes);
    });

    it('should not create a grant with missing required fields', async () => {
        const grantData = {
            role: 'admin',
            action: 'create',
            possession: 'own',
            attributes: ['attribute1', 'attribute2'],
        };

        const grant = new Grant(grantData);

        let error = null;
        try {
            await grant.save();
        } catch (err) {
            error = err;
        }

        expect(error).toBeDefined();
        expect(error.name).toBe('ValidationError');
    });

    it('should not create a grant with same role, resource, action and possession', async () => {
        const grantData = {
            role: 'admin',
            resource: resources.cancelation,
            action: 'create',
            possession: 'own',
            attributes: ['attribute1', 'attribute2'],
        };

        const grant = new Grant(grantData);
        await grant.save();

        let error;
        try {
            await new Grant(grantData).save();
        } catch (err) {
            error = err;
        }
        expect(error).toBeDefined();
        expect(error.name).toBe('MongoServerError');
    });

    // Add more tests as needed
});