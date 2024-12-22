const app = require('../../app');
const { server, http } = require('../fixtures/bettersupertest')(app);
const mockingoose = require('mockingoose');
const User = require('../../app/model/User');
const Product = require('../../app/model/Product');
const Category = require('../../app/model/Category');
const { Grant } = require('../../app/model/Grant');

describe('Routes: Product', () => {
    afterAll(async () => {
        server.close();
    });
    afterEach(() => {
        mockingoose.resetAll();
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        jest.spyOn(Grant, 'find').mockResolvedValue([
            new Grant({ role: "anonymous", resource: "product", action: "read", attributes: ["name", "price"], possession: "any" }),
            new Grant({ role: "anonymous", resource: "product", action: "read", attributes: [], possession: "own" }),
        ]);
    });
    describe('GET /api/product', () => {
        it('should not return 404', async () => {
            const response = await http.get('/api/product');
            expect(response.status).not.toBe(404);
        });
        it('should handle error', async () => {
            mockingoose(Product).toReturn(new Error('Some error'), 'aggregate');
            const response = await http.get('/api/product');
            expect(response.status).toBe(500);
        });
        describe("Paginations error", () => {
            it('should handle negative page number', async () => {
                jest.spyOn(Product, 'countDocuments').mockResolvedValue(0);
                jest.spyOn(Product, 'aggregate').mockResolvedValue([]);
                const response = await http.get('/api/product?page=-1');
                expect(response.status).toBe(200);
                expect(response.data.page).toBe(1);
            });

        });
    });
    describe.skip('GET /api/product/:parentOrID/:id?', () => {
        describe.skip('GET /api/product/:parentOrID', () => {
            describe.skip('When :parentOrID is parent', () => { });
            describe.skip('When :parentOrID is ID', () => { });
        });
        describe.skip('GET /api/product/:parentOrID/:id', () => {
            describe.skip('When :parentOrID is parent and :id child is specified', () => { });
            describe.skip('When :parentOrID is ID and :id child is specified', () => { });
        });
    });

    describe.skip('POST /api/product', () => { });
    describe.skip('PUT /api/product/:id', () => { });
    describe.skip('DELETE /api/product/:id', () => { });

});