const { connect } = require('../../app/config/database');
const Category = require('../../app/model/Category');
// const Ledger = require('../../app/model/Ledger');
const Product = require('../../app/model/Product');
const User = require('../../app/model/User');

async function prepareTestData() {
    const category = await Category.create({
        name: 'Test Category',
        image: 'test.jpg'
    });
    const _doc = {
        category: category._id,
        parent: null,
        name: "Product 1",
        brand: "Brand 1",
        price: 100,
        description: "Description 1",
        images: ["test1.jpg", "test2.jpg"],
        specifications: {
            weight: 100,
            height: 100,
            width: 100,
            length: 100,
            color: "red",
            material: "plastic",
        },
        highlights: ["highlight 1", "highlight 2"],
        technicalDetails: {
            power: 100,
            voltage: 100,
            capacity: 100,
            speed: 100,
            resolution: 100,
        },
        packingDetails: {
            weight: 100,
            height: 100,
            width: 100,
            length: 100,
        },
        additionalDetails: {
            importer: "importer 1",
            manufacturer: "manufacturer 1",
        },
    };
    const product = await Product.create(_doc);
    const user = await User.create({
        name: 'Test User',
        email: 'test@user.com',
        password: 'password'
    });
}


describe('Ledger Model', () => {
    let connection;
    beforeAll(async () => {
        connection = await connect();
        await prepareTestData();
    });
    afterAll(async () => {
        await connection.disconnect();
    });
    it.todo('should create a new ledger');
    it.todo('should find a ledger by id');
});