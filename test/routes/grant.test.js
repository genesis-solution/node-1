const request = require('supertest');
const app = require('../../app');
const { Grant } = require('../../app/model/Grant');
const User = require('../../app/model/User');
const { connect } = require('../../app/config/database');


describe('Routes: Grant', () => {
    let connection;

    beforeAll(async () => {
        connection = await connect('test-grants');
    });

    afterAll(async () => {
        await Promise.all([
            Grant.deleteMany(),
        ]);
        await connection.disconnect();
    });

    afterEach(async () => {
        await Promise.all([
            Grant.deleteMany(),
        ]);
        jest.restoreAllMocks();
    });

    describe('GET /api/grants', () => {
        const owner = new User({role: 'owner', verified: true, disabled: false})
        const token = owner.generateToken()
        beforeEach(() => {
            jest.spyOn(User, 'findById').mockResolvedValue(owner);
        })

        it('should not return 404', async () => {
            const findGrant = jest.spyOn(Grant, 'find').mockResolvedValue([]);
            const findOneUser = jest.spyOn(User, 'findOne').mockResolvedValue(new User());
            const res = await request(app).get('/api/grants');
            expect(res.status).not.toBe(404);
        });

        it('should return all grants', async () => {
            const findGrant = jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({
                    role: 'owner',
                    resource: 'grant',
                    action: 'read',
                    possession: 'any',
                    attributes: ['*'],
                }),
            ]);
            const res = await request(app)
                .get('/api/grants')
                .set('Authorization', `Bearer ${token}`);
            expect(findGrant).toHaveBeenCalled();
            expect(res.status).toBe(200);
            expect(res.body).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    role: 'owner',
                    resource: 'grant',
                    action: 'read',
                    possession: 'any',
                    attributes: ['*'],
                }),
            ]));
        });

        it('should return forbidden on invalid permissions', async () => {
            const findGrant = jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({
                    role: 'owner',
                    resource: 'grant',
                    action: 'read',
                    possession: 'own',
                    attributes: ['*'],
                }),
            ]);
            const res = await request(app)
                .get('/api/grants')
                .set('Authorization', `Bearer ${token}`);
            expect(findGrant).toHaveBeenCalled();
            expect(res.status).toBe(403);
        });

        it('should return forbidden on invalid role', async () => {
            const findGrant = jest.spyOn(Grant, 'find');
            await Grant.create({
                role: 'admin',
                resource: 'grant',
                action: 'read',
                possession: 'any',
                attributes: ['*'],
            });

            const res = await request(app)
                .get('/api/grants')
                .set('Authorization', `Bearer ${token}`);
            expect(findGrant).toHaveBeenCalled();
            expect(res.status).toBe(403);
        });

        it('should handle errors', async () => {
            const findGrant = jest.spyOn(Grant, 'find')
                .mockResolvedValueOnce([
                    new Grant({
                        role: 'owner',
                        resource: 'grant',
                        action: 'read',
                        possession: 'any',
                        attributes: ['*'],
                    }),
                ])
                .mockRejectedValue(new Error('error'));

            const res = await request(app)
                .get('/api/grants')
                .set('Authorization', `Bearer ${token}`);
            expect(findGrant).toHaveBeenCalled();
            expect(res.status).toBe(500);

        });

    });

    describe('POST /api/grants', () => {
        const owner = new User({role: 'owner', verified: true, disabled: false})
        const token = owner.generateToken()
        let findOneUser;

        beforeEach(() => {
             findOneUser = jest.spyOn(User, 'findById').mockResolvedValue(owner);
        })
        it('should not return 404', async () => {
            const res = await request(app).post('/api/grants');
            expect(res.status).not.toBe(404);
        });

        it('should create a grant', async () => {
            const findGrant = jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({
                    role: 'owner',
                    resource: 'grant',
                    action: 'create',
                    possession: 'any',
                    attributes: ['*'],
                }),
            ]);


            const res = await request(app)
                .post('/api/grants')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    role: 'owner',
                    resource: 'grant',
                    action: 'read',
                    possession: 'any',
                    attributes: ['*'],
                });
            expect(findOneUser).toHaveBeenCalled();
            expect(findGrant).toHaveBeenCalled();
            expect(res.status).toBe(201);

        });

        it('should return bad request on invalid data', async () => {
            const findGrant = jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({
                    role: 'owner',
                    resource: 'grant',
                    action: 'create',
                    possession: 'any',
                    attributes: ['*'],
                }),
            ]);


            const res = await request(app)
                .post('/api/grants')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    role: 'invalid',
                    resource: 'invalid',
                    action: 'invalid',
                    possession: 'invalid',
                });
            expect(findOneUser).toHaveBeenCalled();
            expect(findGrant).toHaveBeenCalled();
            expect(res.status).toBe(400);
        });

        it('should return 409 conflict on duplicate key error', async () => {
            const findGrant = jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({
                    role: 'owner',
                    resource: 'grant',
                    action: 'create',
                    possession: 'any',
                    attributes: ['*'],
                }),
            ]);


             await request(app)
                .post('/api/grants')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    role: 'owner',
                    resource: 'grant',
                    action: 'create',
                    possession: 'any',
                    attributes: ['*'],
                });
            const res = await request(app)
                .post('/api/grants')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    role: 'owner',
                    resource: 'grant',
                    action: 'create',
                    possession: 'any',
                    attributes: ['*'],
                });
            expect(findOneUser).toHaveBeenCalled();
            expect(findGrant).toHaveBeenCalled();
            expect(res.status).toBe(409);

        });

        it('should handle errors', async () => {
            const findGrant = jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({
                    role: 'owner',
                    resource: 'grant',
                    action: 'create',
                    possession: 'any',
                    attributes: ['*'],
                }),
            ]);

            const createGrant = jest.spyOn(Grant, 'create').mockRejectedValue(new Error('error'));


            const res = await request(app)
                .post('/api/grants')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    role: 'owner',
                    resource: 'grant',
                    action: 'read',
                    possession: 'any',
                    attributes: ['*'],
                });
            expect(findOneUser).toHaveBeenCalled();
            expect(findGrant).toHaveBeenCalled();
            expect(res.status).toBe(500);
        });

        it('should return forbidden on invalid permissions', async () => {

            const res = await request(app)
                .post('/api/grants')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    role: 'owner',
                    resource: 'grant',
                    action: 'read',
                    possession: 'own',
                    attributes: ['*'],
                });
            expect(findOneUser).toHaveBeenCalled();
            expect(res.status).toBe(403);
        });

        it('should return forbidden on invalid role', async () => {
            await Grant.create({
                role: 'admin',
                resource: 'grant',
                action: 'read',
                possession: 'any',
                attributes: ['*'],
            });

            const res = await request(app)
                .post('/api/grants')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    role: 'admin',
                    resource: 'grant',
                    action: 'read',
                    possession: 'any',
                    attributes: ['*'],
                });
            expect(findOneUser).toHaveBeenCalled();
            expect(res.status).toBe(403);
        });

    });

    describe('PATCH /api/grants/:id', () => {
        const owner = new User({role: 'owner', verified: true, disabled: false})
        const token = owner.generateToken()
        let findOneUser;

        beforeEach(() => {
            findOneUser = jest.spyOn(User, 'findById').mockResolvedValue(owner);
        })

        it('should not return 404', async () => {
            const res = await request(app).patch('/api/grants/1');
            expect(res.status).not.toBe(404);
        });

        it('should return bad request on invalid id', async () => {

            const findGrant = jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({
                    role: 'owner',
                    resource: 'grant',
                    action: 'update',
                    possession: 'any',
                    attributes: ['*'],
                }),
            ]);

            const res = await request(app)
                .patch('/api/grants/invalid')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    role: 'owner',
                    resource: 'grant',
                    action: 'read',
                    possession: 'any',
                    attributes: ['*'],
                });
            expect(findOneUser).toHaveBeenCalled();
            expect(findGrant).toHaveBeenCalled();
            expect(res.status).toBe(400);
        });

        it('should update a grant', async () => {
            const grant = await Grant.create({
                role: 'owner',
                resource: 'grant',
                action: 'update',
                possession: 'any',
                attributes: ['*'],
            });
            const findGrant = jest.spyOn(Grant, 'find').mockResolvedValue([
                grant,
            ]);
            const res = await request(app)
                .patch(`/api/grants/${grant._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    role: 'owner',
                    resource: 'grant',
                    action: 'read',
                    possession: 'any',
                    attributes: ['*'],
                });
            expect(findOneUser).toHaveBeenCalled();
            expect(findGrant).toHaveBeenCalled();
            expect(res.status).toBe(204);
        });

        it('should not update excluded attributes', async () => {
            const grant = await Grant.create({
                role: 'admin',
                resource: 'grant',
                action: 'update',
                possession: 'any',
                attributes: ['*', '!resource'],
            });
            const findGrant = jest.spyOn(Grant, 'find').mockResolvedValue([
                grant,
            ]);
            const admin = new User({
                role: 'admin',
                _id: '1',
                disabled: false,
                verified: true
            });
            const findOneUser = jest.spyOn(User, 'findById').mockResolvedValue(admin);
            const token = admin.generateToken();
            const res = await request(app)
                .patch(`/api/grants/${grant._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    role: 'admin',
                    resource: 'user',
                    action: 'read',
                    possession: 'any',
                    attributes: ['*'],
                });

            expect(findOneUser).toHaveBeenCalled();
            expect(findGrant).toHaveBeenCalled();
            expect(res.status).toBe(204);
            const updatedGrant = await Grant.findById(grant._id);
            expect(updatedGrant.resource).toBe('grant');
        });


        it('should return 404 on not found', async () => {
            const grant = await Grant.create({
                role: 'owner',
                resource: 'grant',
                action: 'update',
                possession: 'any',
                attributes: ['*'],
            });
            const findGrant = jest.spyOn(Grant, 'find').mockResolvedValue([
                grant,
            ]);

            const res = await request(app)
                .patch(`/api/grants/5b360fdea392d731829ded18`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    role: 'owner',
                    resource: 'grant',
                    action: 'read',
                    possession: 'any',
                    attributes: ['*'],
                });
            expect(findOneUser).toHaveBeenCalled();
            expect(findGrant).toHaveBeenCalled();
            expect(res.status).toBe(404);
        });

        it('should return bad request on invalid data', async () => {
            const grant = await Grant.create({
                role: 'owner',
                resource: 'grant',
                action: 'update',
                possession: 'any',
                attributes: ['*'],
            });
            const findGrant = jest.spyOn(Grant, 'find').mockResolvedValue([
                grant,
            ]);

            const res = await request(app)
                .patch(`/api/grants/${grant._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    role: 'invalid',
                    resource: 'invalid',
                    action: 'invalid',
                    possession: 'invalid',
                });
            expect(findOneUser).toHaveBeenCalled();
            expect(findGrant).toHaveBeenCalled();
            expect(res.status).toBe(400);
        });

        it('should return forbidden on invalid permissions', async () => {
            const grant = await Grant.create({
                role: 'owner',
                resource: 'grant',
                action: 'read',
                possession: 'any',
                attributes: ['*'],
            });
            const findGrant = jest.spyOn(Grant, 'find').mockResolvedValue([
                grant,
            ]);

            const res = await request(app)
                .patch(`/api/grants/${grant._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    role: 'owner',
                    resource: 'grant',
                    action: 'read',
                    possession: 'own',
                    attributes: ['*'],
                });
            expect(findOneUser).toHaveBeenCalled();
            expect(findGrant).toHaveBeenCalled();
            expect(res.status).toBe(403);
        });

        it('should return forbidden on invalid role', async () => {
            const grant = await Grant.create({
                role: 'admin',
                resource: 'grant',
                action: 'read',
                possession: 'any',
                attributes: ['*'],
            });
            const findGrant = jest.spyOn(Grant, 'find').mockResolvedValue([
                grant,
            ]);
            const res = await request(app)
                .patch(`/api/grants/${grant._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    role: 'admin',
                    resource: 'grant',
                    action: 'read',
                    possession: 'any',
                    attributes: ['*'],
                });
            expect(findOneUser).toHaveBeenCalled();
            expect(findGrant).toHaveBeenCalled();
            expect(res.status).toBe(403);
        });

    });

    describe('DELETE /api/grants/:id', () => {
        const owner = new User({role: 'owner', verified: true, disabled: false})
        const token = owner.generateToken()
        let findOneUser;

        beforeEach(() => {
            findOneUser = jest.spyOn(User, 'findById').mockResolvedValue(owner);
        })

        it('should not return 404', async () => {
            const res = await request(app).delete('/api/grants/1');
            expect(res.status).not.toBe(404);
        });

        it('should delete a grant', async () => {
            const grant = await Grant.create({
                role: 'owner',
                resource: 'grant',
                action: 'delete',
                possession: 'any',
                attributes: ['*'],
            });
            const findGrant = jest.spyOn(Grant, 'find').mockResolvedValue([
                grant,
            ]);

            const res = await request(app)
                .delete(`/api/grants/${grant._id}`)
                .set('Authorization', `Bearer ${token}`);
            expect(findOneUser).toHaveBeenCalled();
            expect(findGrant).toHaveBeenCalled();
            expect(res.status).toBe(204);
        });

        it('should return 404 on not found', async () => {
            const grant = await Grant.create({
                role: 'owner',
                resource: 'grant',
                action: 'delete',
                possession: 'any',
                attributes: ['*'],
            });
            const findGrant = jest.spyOn(Grant, 'find').mockResolvedValue([
                grant,
            ]);

            const res = await request(app)
                .delete(`/api/grants/5b360fdea392d731829ded18`)
                .set('Authorization', `Bearer ${token}`);
            expect(findOneUser).toHaveBeenCalled();
            expect(findGrant).toHaveBeenCalled();
            expect(res.status).toBe(404);
        });

        it('should return bad request on invalid id', async () => {
            const findGrant = jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({
                    role: 'owner',
                    resource: 'grant',
                    action: 'delete',
                    possession: 'any',
                    attributes: ['*'],
                }),
            ]);

            const res = await request(app)
                .delete('/api/grants/invalid')
                .set('Authorization', `Bearer ${token}`);
            expect(findOneUser).toHaveBeenCalled();
            expect(findGrant).toHaveBeenCalled();
            expect(res.status).toBe(400);
        });

        it('should return forbidden on invalid permissions', async () => {
            const grant = await Grant.create({
                role: 'owner',
                resource: 'grant',
                action: 'read',
                possession: 'any',
                attributes: ['*'],
            });
            const findGrant = jest.spyOn(Grant, 'find').mockResolvedValue([
                grant,
            ]);

            const res = await request(app)
                .delete(`/api/grants/${grant._id}`)
                .set('Authorization', `Bearer ${token}`);
            expect(findOneUser).toHaveBeenCalled();
            expect(findGrant).toHaveBeenCalled();
            expect(res.status).toBe(403);
        });

        it('should return forbidden on invalid role', async () => {
            const grant = await Grant.create({
                role: 'admin',
                resource: 'grant',
                action: 'read',
                possession: 'any',
                attributes: ['*'],
            });
            const findGrant = jest.spyOn(Grant, 'find').mockResolvedValue([
                grant,
            ]);
            const res = await request(app)
                .delete(`/api/grants/${grant._id}`)
                .set('Authorization', `Bearer ${token}`);
            expect(findOneUser).toHaveBeenCalled();
            expect(findGrant).toHaveBeenCalled();
            expect(res.status).toBe(403);
        });

        it('should handle errors', async () => {
            const grant = await Grant.create({
                role: 'owner',
                resource: 'grant',
                action: 'delete',
                possession: 'any',
                attributes: ['*'],
            });
            const findGrant = jest.spyOn(Grant, 'find').mockResolvedValue([
                grant,
            ]);

            const deleteGrant = jest.spyOn(Grant, 'findByIdAndDelete').mockRejectedValue(new Error('error'));
            const res = await request(app)
                .delete(`/api/grants/${grant._id}`)
                .set('Authorization', `Bearer ${token}`);
            expect(findOneUser).toHaveBeenCalled();
            expect(findGrant).toHaveBeenCalled();
            expect(deleteGrant).toHaveBeenCalled();
            expect(res.status).toBe(500);
        });

    });

});