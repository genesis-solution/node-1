const Amenity = require('../../app/model/Amenity');
const mongoose = require('mongoose');
const database = require('../../app/config/database');
const mongodb = require('mongodb');
const debug = require('debug')('app:test:model:Amenity');


describe('Amenity Model integration test', () => {
    let connection;
    beforeAll(async () => {
        connection = await database.connect('testAmenity');

    });

    beforeEach(async () => {
        await Amenity.deleteMany({});
    });

    afterAll(async () => {
        await Amenity.deleteMany({});
        await connection.disconnect();
    });

    it("should create a new Amenity", async () => {
        const _doc = { name: "Amenity 1", image: "image1.jpg", };
       const amenity = new Amenity(_doc);
        await amenity.save();
        const result = await Amenity.find({});
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe(_doc.name);
        expect(result[0].image).toBe(_doc.image);
    });


    it("should not create a new Amenity without name and image", async () => {
       const amenity = new Amenity({});
        expect(amenity.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should not create a new Amenity with duplicate name", async () => {
       const amenity1 = new Amenity({ name: "Amenity 1", image: "image1.jpg" });
       const amenity2 = new Amenity({ name: "Amenity 1", image: "image2.jpg" });
        await amenity1.save();
        await expect(amenity2.save()).rejects.toThrow("E11000 duplicate key error collection: testAmenity.amenities index: name_1 dup key: { name: \"Amenity 1\" }");
    });

    it("should contain properties _id, name, image, id", async () => {
       const amenity = new Amenity({ name: "Amenity 2", image: "image1.jpg" });
        await amenity.save();
        const result = await Amenity.findOne({});
        expect(result).toHaveProperty("_id");
        expect(result).toHaveProperty("name");
        expect(result).toHaveProperty("image");
        expect(result).toHaveProperty("id");
    });

});
