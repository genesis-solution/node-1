const database = require("../../app/config/database");
const Product = require("../../app/model/Product");
const Category = require("../../app/model/Category");
const Amenity = require("../../app/model/Amenity");
const User = require("../../app/model/User");
const Order = require("../../app/model/Order");
const Sequence = require("../../app/model/Sequence").Sequence;
const debug = require("debug")("app:test:model:product");
const ObjectId = require("mongoose").Types.ObjectId;

describe("Product integration test", () => {
    /** @type {typeof import("mongoose")} */
    let mongoose;
    beforeAll(async () => {
        mongoose = await database.connect('testproduct');
        await Product.deleteMany({});
    });
    afterAll(async () => {
        await Product.deleteMany({});
        await mongoose.disconnect();
    });
    beforeEach(async () => {
        await Promise.all([
            Product.deleteMany({}),
            Category.deleteMany({}),
            Amenity.deleteMany({}),
            Sequence.deleteMany({}),
        ]);
    });

    const _doc = {
        id: undefined,

        owner: new User(),

        draft: undefined,
        approved: undefined,
        hidden: undefined,

        docs: ['doc1.jpg', 'doc2.jpg'],
        images: ['image1.jpg', 'image2.jpg'],

        name: "Spot 1",
        description: "Description 1",

        price: 100,
        maxCapacity: 100,
        area: 100,

        amenities: [new Amenity(), new Amenity()],
        categories: [new Category(), new Category()],

        location: {
            location: {
                type: "Point",
                coordinates: [100, 100],
            },
            address: "Address 1",
            zipCode: "100",
            city: "City 1",
            road: "Road 1",
            state: "State 1",
            country: "Country 1",
        },

        type: undefined,

        availability: {
            Sunday: {
                open: undefined,
                close: undefined,
                holiday: undefined,
            },
            Monday: {
                open: undefined,
                close: undefined,
                holiday: undefined,
            },
            Tuesday: {
                open: undefined,
                close: undefined,
                holiday: undefined,
            },
            Wednesday: {
                open: undefined,
                close: undefined,
                holiday: undefined,
            },
            Thursday: {
                open: undefined,
                close: undefined,
                holiday: undefined,
            },
            Friday: {
                open: undefined,
                close: undefined,
                holiday: undefined,
            },
            Saturday: {
                open: undefined,
                close: undefined,
                holiday: undefined,
            },

        },

        rules: undefined,

    };

    it("should create a new product", async () => {




        const product = new Product(_doc);
        await product.save();

        const found = await Product.findOne({ _id: product._id });
        //debug(found);
        expect(found).toBeTruthy();
        expect(found._id).toEqual(product._id);

        expect(found.draft).toEqual(false);
        expect(found.approved).toEqual(false);
        expect(found.hidden).toEqual(false);

        expect(found.owner._id).toStrictEqual(_doc.owner._id);

        expect(found.name).toEqual(_doc.name);
        expect(found.description).toEqual(_doc.description);

        expect(found.price).toEqual(_doc.price);
        expect(found.maxCapacity).toEqual(_doc.maxCapacity);
        expect(found.area).toEqual(_doc.area);

        expect(found.images).toEqual(_doc.images);
        expect(found.docs).toEqual(_doc.docs);

        expect(found.categories).toStrictEqual(_doc.categories.map(c => c._id));
        expect(found.amenities).toStrictEqual(_doc.amenities.map(a => a._id));

        expect(found.location.toObject()).toStrictEqual(_doc.location);
        expect(found.type).toEqual('indoor');

        const _9_AM = new Date(0, 0, 0, 9, 0, 0);
        const _9_PM = new Date(0, 0, 0, 21, 0, 0);

        expect(found.availability.Sunday.open).toEqual(_9_AM);
        expect(found.availability.Sunday.close).toEqual(_9_PM);
        expect(found.availability.Sunday.holiday).toEqual(false);

        expect(found.availability.Monday.open).toEqual(_9_AM);
        expect(found.availability.Monday.close).toEqual(_9_PM);
        expect(found.availability.Monday.holiday).toEqual(false);

        expect(found.availability.Tuesday.open).toEqual(_9_AM);
        expect(found.availability.Tuesday.close).toEqual(_9_PM);
        expect(found.availability.Tuesday.holiday).toEqual(false);


        expect(found.availability.Wednesday.open).toEqual(_9_AM);
        expect(found.availability.Wednesday.close).toEqual(_9_PM);
        expect(found.availability.Wednesday.holiday).toEqual(false);

        expect(found.availability.Thursday.open).toEqual(_9_AM);
        expect(found.availability.Thursday.close).toEqual(_9_PM);
        expect(found.availability.Thursday.holiday).toEqual(false);

        expect(found.availability.Friday.open).toEqual(_9_AM);
        expect(found.availability.Friday.close).toEqual(_9_PM);
        expect(found.availability.Friday.holiday).toEqual(false);

        expect(found.availability.Saturday.open).toEqual(_9_AM);
        expect(found.availability.Saturday.close).toEqual(_9_PM);
        expect(found.availability.Saturday.holiday).toEqual(false);

        expect(found.rules).toEqual([]);




        expect(found.id).toBeDefined();

    });

    it("should validate category and amenity", async () => {
        const product = new Product({
            ..._doc,
            categories: [],
            amenities: [],
        });

        expect(product.validateSync()).toBeDefined();
        try {
            await product.save();
            expect(true).toBeFalsy();
        } catch (error) {
            expect(error.errors['categories'].message).toBeDefined();
            expect(error.errors['amenities'].message).toBeDefined();
        }
    });

    it("should validate image and doc", async () => {
        const product = new Product({
            ..._doc,
            images: [],
            docs: [],
        });

        expect(product.validateSync()).toBeDefined();
        try {
            await product.save();
            expect(true).toBeFalsy();
        } catch (error) {
            expect(error.errors['images'].message).toBeDefined();
            expect(error.errors['docs'].message).toBeDefined();
        }
    });

    it('should ignore validation if product is draft', async () => {
        const product = new Product({
            draft: true,
        });
        await product.save();
        expect(product.draft).toEqual(true);
    });

    describe("Product.fetch", () => {
        it("should fetch all products", async () => {
            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
                banner: "test.jpg",
            });
            const amenity = new Amenity({
                name: "Amenity 1",
                image: "test.jpg",
            });

            await category.save();
            await amenity.save();

            const product = new Product({
                ..._doc,
                categories: [category._id],
                amenities: [amenity._id],
            });
            await product.save();
            const products = await Product.fetch();
            expect(products.length).toEqual(1);
            expect(products[0]._id).toEqual(product._id);
            expect(products[0].name).toEqual(product.name);


        });

        it("should fetch all products with populated Category and Amenity", async () => {
            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
                banner: "test.jpg",
            });
            const amenity = new Amenity({
                name: "Amenity 1",
                image: "test.jpg",
            });

            await category.save();
            await amenity.save();

            const product = new Product({
                ..._doc,
                categories: [category._id],
                amenities: [amenity._id],
            });
            await product.save();
            const products = await Product.fetch();
            expect(products.length).toEqual(1);
            expect(products[0]._id).toEqual(product._id);
            expect(products[0].name).toEqual(product.name);
            expect(products[0].categories[0].name).toEqual(category.name);
            expect(products[0].amenities[0].name).toEqual(amenity.name);

        });





        it("should resolve filter with category", async () => {
            const category1 = new Category();
            const category2 = new Category();



            const product = new Product({
                ..._doc,
                categories: [category1._id, category2._id],
            });
            const product2 = new Product({
                ..._doc,
                categories: [category2._id],
            });
            await product.save();
            await product2.save();
            const products = await Product.fetch({ categories: [category1._id] });
            expect(products.length).toEqual(1);
        });

        it("should resolve filter with category._id of string type", async () => {
            const category2 = new Category();
            const category1 = new Category();



            const product = new Product({
                ..._doc,
                categories: [category1._id, category2._id],
            });
            const product2 = new Product({
                ..._doc,
                categories: [category2._id],
            });
            await product.save();
            await product2.save();
            const products = await Product.fetch({ categories: [category1._id.toString()] });
            expect(products.length).toEqual(1);
        });

        it('should filter by date holiday', async () => {
           
            const product = new Product({
                ..._doc,
            });
            await product.save();

            const products2 = await Product.fetch({
                date: new Date(),
            });
            // it should return product because it is available at the time
            expect(products2.length).toEqual(1);

        });

        describe("Pagination", () => {
            it("should paginate on {limit: 1, skip: 0}", async () => {
                const category2 = new Category();
                const category1 = new Category();

                const product = new Product({
                    ..._doc,
                    categories: [category1._id, category2._id],
                });
                const product2 = new Product({
                    ..._doc,
                    categories: [category2._id],
                });
                await product.save();
                await product2.save();
                const products = await Product.fetch({}, { limit: 1, skip: 0 });
                expect(products.length).toEqual(1);
                expect(products[0]._id).toEqual(product._id);
            });
            it("should paginate on {limit: 1, skip: 1}", async () => {
                const category2 = new Category();
                const category1 = new Category();

                const product = new Product({
                    ..._doc,
                    categories: [category1._id, category2._id],
                });
                const product2 = new Product({
                    ..._doc,
                    categories: [category2._id],
                });
                await product.save();
                await product2.save();
                const products = await Product.fetch({}, { limit: 1, skip: 1 });
                expect(products.length).toEqual(1);
                expect(products[0]._id).toEqual(product2._id);
            });
            it("should paginate with options ", async () => {
                const options = { skip: 0, limit: 5 };
                const category = new Category({});

                const doc = {
                    ..._doc,
                    categories: [category._id],
                };

                const product = new Product(doc);
                await product.save();

                await Promise.all(Array.from({ length: 10 }).map((_, i) => Product.create({
                    ...doc,
                    name: `Product ${i + 2}`
                })));
                const products = await Product.fetch({}, options);
                expect(products.length).toEqual(options.limit);
            });
        });

    });




});