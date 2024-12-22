const User = require("../../app/model/User");
const Support = require("../../app/model/Support");
const { connect } = require("../../app/config/database");

describe('Model Support', () => {
    let connection;
    beforeAll(async () => {
        connection = await connect('test-support-model');
    });
    afterAll(async () => {
        await Support.deleteMany();
        await connection.disconnect();
    });

    it('should create a new support', async () => {
        const user = new User();
        const doc = {
            title: 'Test Support',
            description: 'Test Description',
            type: 'technical',
            status: "resolved",
            priority: "high",
            reference: "ORDER_123",
            screenshots: ['screenshot1', 'screenshot2'],
            user: user._id,
            email: 'test'
        };
        const support = await Support.create(doc);
        expect(support.title).toBe(doc.title);
        expect(support.description).toBe(doc.description);
        expect(support.type).toBe(doc.type);
        expect(support.status).toBe(doc.status);
        expect(support.priority).toBe(doc.priority);
        expect(support.reference).toBe(doc.reference);
        expect(support.screenshots).toEqual(doc.screenshots);
        expect(support.user).toEqual(doc.user);

        expect(support.createdAt).toBeDefined();
        expect(support.updatedAt).toBeDefined();
        expect(support.id).toBeDefined();
    });
    it('should not create without user or email', async () => {
        const doc = {
            title: 'Test Support',
            description: 'Test Description',
            type: 'technical',
            status: "resolved",
            priority: "high",
            reference: "ORDER_123",
            screenshots: ['screenshot1', 'screenshot2'],
        };
        try {
            await Support.create(doc);
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
});