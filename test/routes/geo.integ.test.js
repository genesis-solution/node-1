
const request = require('supertest');
const app = require('../../app');
const geo = require('../../app/service/geo');
const { Grant } = require('../../app/model/Grant');
const User = require('../../app/model/User');

describe('Route: reverse', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    describe('GET /api/geo/reverse', () => {
        beforeEach(() => {
            jest.spyOn(Grant, 'find')
                .mockResolvedValue([new Grant({ role: 'admin', resource: 'geo', action: 'read', possession: 'any', attributes: ['*'] })]);
        });
        it('should return the reverse geocoding result', async () => {

            const mockResult = {
                address: '123 Main St',
                zipCode: '12345',
                city: 'New York',
                road: 'Main St',
                state: 'NY',
                country: 'USA'
            };
            jest.spyOn(geo, 'reverse').mockResolvedValue(mockResult);
            const user = new User({ role: 'admin', disabled: false, verified: true });
            jest.spyOn(User, 'findById').mockResolvedValue(user);
            const response = await request(app)
                .get('/api/geo/reverse')
                .set('Authorization', `Bearer ${user.generateToken()}`)
                .query({ latitude: 40.7831, longitude: -73.9712 });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResult);
            expect(geo.reverse).toHaveBeenCalledWith({ latitude: 40.7831, longitude: -73.9712 });
        });

        it('should handle errors', async () => {
            const mockError = new Error('Something went wrong');
            geo.reverse = jest.fn().mockRejectedValue(mockError);

            const user = new User({ role: 'admin', disabled: false, verified: true });
            jest.spyOn(User, 'findById').mockResolvedValue(user);


            const response = await request(app)
                .get('/api/geo/reverse')
                .set('Authorization', `Bearer ${user.generateToken()}`)
                .query({ latitude: 40.7831, longitude: -73.9712 });

            expect(response.status).toBe(500);
        });
    });
});