const app = require('../../app');
const bettersupertest = require('../fixtures/bettersupertest');
const Product = require('../../app/model/Product');
const Category = require('../../app/model/Category');
const database = require('../../app/config/database');
const User = require('../../app/model/User');
const Amenity = require('../../app/model/Amenity');
const { seedGrants } = require('../../app/seed');
const { Grant, resources } = require('../../app/model/Grant');
const { default: axios } = require('axios');
const debug = require('debug')('app:test:product');
const ObjectId = require('mongoose').Types.ObjectId;
const fs = require('fs');

const _doc = {
    id: undefined,

    owner: new ObjectId(),

    draft: undefined,
    approved: undefined,
    hidden: undefined,

    docs: ['test'],
    images: ['test'],

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

describe('Routes: Product integ', () => {
    /** @type {import("mongoose")} */
    let connection;
    const user = {
        email: "test@user.com",
        password: "password",
        name: "Test User",
        profilePic: "profile.jpg",
        role: "user"
    };
    const admin = {
        email: "test@admin.com",
        password: "password",
        name: "Test Admin",
        profilePic: "profile.jpg",
        role: "admin"
    };

    const { server, http } = bettersupertest(app);

    beforeAll(async () => {
        connection = await database.connect("product-test-route");
        await User.create(admin);
        await User.create(user);
        await seedGrants();
    });

    beforeEach(async () => {

    });

    afterAll(async () => {
        await connection.disconnect();
        server.close();
    });


    afterEach(async () => {
        await Product.deleteMany({});
        await Category.deleteMany({});
        await Amenity.deleteMany({});
        jest.restoreAllMocks();
    });

    describe('GET /api/product', () => {
        it('should return a list of products', async () => {

            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
            });
            const category2 = new Category({
                parent: null,
                name: "Category 2",
                image: "test.jpg",
            });
            await category.save();
            await category2.save();
            const amenity = await Amenity.create({
                name: "Amenity 1",
                image: "icon.jpg",
            });


            const doc = {
                ..._doc,
                categoryies: [category._id, category2._id],
                amenities: [amenity],
                approved: true,
            };
            const product = new Product(doc);
            await product.save();
            jest.spyOn(Grant, 'find').mockResolvedValue([new Grant({
                action: 'read',
                possession: 'any',
                resource: resources.product,
                role: 'annonymous',
                attributes: ['_id', 'name', 'description', 'price', 'amenities', 'images'],
            })]);

            const res = await http.get('/api/product');
            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('products');
            const data = res.data.products;
            expect(data).toHaveLength(1);
            const productData = data[0];
            expect(productData).toStrictEqual({
                _id: product._id.toString(),
                name: doc.name,
                description: doc.description,
                price: doc.price,
                amenities: doc.amenities.map(a => JSON.parse(JSON.stringify(a))),
                images: doc.images,
            });

        });
        it('should filter based on attributes in permission', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "anonymous", resource: "product", action: "read", attributes: ["name", "price"], possession: "any" }),
            ]);

            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
            });
            await category.save();

            const doc = {
                ..._doc,
                categories: [category._id],
                approved: true,

            };
            const product = new Product(doc);
            await product.save();

            const res = await http.get('/api/product');
            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('products');

            const data = res.data.products;
            expect(data).toHaveLength(1);
            expect(data[0]).toEqual({
                name: doc.name,
                price: doc.price,
            });
        });
        it('should not return with products og hidden: true', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "anonymous", resource: "product", action: "read", attributes: ["name", "price"], possession: "any" }),
                new Grant({ role: "anonymous", resource: "product", action: "read", attributes: [], possession: "own" }),
            ]);

            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
            });
            await category.save();

            const doc = {
                ..._doc,
                categories: [category._id],
                hidden: true,
            };
            const product = new Product(doc);
            await product.save();

            const res = await http.get('/api/product');
            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('products');

            const data = res.data.products;
            expect(data).toHaveLength(0);

        });

        it('should not retuen porducts of darft: true', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "anonymous", resource: "product", action: "read", attributes: ["name", "price"], possession: "any" }),
                new Grant({ role: "anonymous", resource: "product", action: "read", attributes: [], possession: "own" }),
            ]);

            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
            });
            await category.save();

            const doc = {
                ..._doc,
                categories: [category._id],
                draft: true,
            };
            const product = new Product(doc);
            await product.save();

            const res = await http.get('/api/product');
            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('products');

            const data = res.data.products;
            expect(data).toHaveLength(0);
        });

        it('should return a list of products with amenities populated and categories populated', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "anonymous", resource: "product", action: "read", attributes: ['*'], possession: "any" }),
                new Grant({ role: "anonymous", resource: "product", action: "read", attributes: [], possession: "own" }),
            ]);

            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
            });
            await category.save();

            const amenity = await Amenity.create({
                name: "Amenity 1",
                image: "icon.jpg",
            });

            const doc = {
                ..._doc,
                categories: [category._id],
                amenities: [amenity],
                approved: true,

            };
            const product = new Product(doc);
            await product.save();

            const res = await http.get('/api/product');
            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('products');

            const data = res.data.products;
            expect(data).toHaveLength(1);

            const productData = data[0];
            expect(productData.amenities).toHaveLength(1);
            expect(productData.categories).toHaveLength(1);
        });


        describe("Filtering", () => {
            it('should return a list of products filtered by category', async () => {
                const category = new Category({
                    parent: null,
                    name: "Category 1",
                    image: "test.jpg",
                });
                await category.save();
                const category2 = new Category({
                    parent: null,
                    name: "Category 2",
                    image: "test.jpg",
                });
                await category2.save();
                const doc = {
                    ..._doc,
                    categories: [category._id],
                    approved: true,

                };

                const product = new Product(doc);
                await product.save();
                const product2 = new Product({
                    ..._doc,
                    categories: [category2._id],
                    approved: true,

                });
                await product2.save();

                const res = await http
                    .get('/api/product', { params: { categories: [category._id] } });


                expect(res.status).toBe(200);
                expect(res.data).toHaveProperty('products');
                const products = res.data.products;
                expect(products).toHaveLength(1);
                expect(products[0].name).toBe(doc.name);
            });

            it('should return a list of products filtered by price range', async () => {
                const category = new Category({
                    parent: null,
                    name: "Category 1",
                    image: "test.jpg",
                });
                await category.save();
                await Promise.all(Array(20).fill(0).map((_, i) => Product.create({
                    ..._doc,
                    category: category._id,
                    price: i + 100,
                    name: `Product ${i + 2}`,
                    approved: true,

                })));
                const res = await http.get('/api/product', { params: { price: [100, 105] } });
                expect(res.status).toBe(200);
                expect(res.data).toHaveProperty('products');
                const products = res.data.products;
                expect(products.some(p => p.price < 100 || p.price > 105)).toBe(false);
                expect(products.some(p => p.price >= 100 && p.price <= 105)).toBe(true);

            });
            it('should return a list of products filtered by name', async () => {
                const category = new Category({
                    parent: null,
                    name: "Category 1",
                    image: "test.jpg",
                });
                await category.save();
                const doc = {
                    ..._doc,
                    category: category._id,
                    approved: true,

                };
                const product = new Product(doc);
                await product.save();
                const product2 = new Product({
                    ..._doc,
                    parent: null,
                    name: "Product 2",
                    brand: "Brand 2",
                    price: 200,
                    description: "Description 2",
                    images: ["test1.jpg", "test2.jpg"],
                    category: category._id,
                    approved: true,

                });
                await product2.save();
                const res = await http.get('/api/product', { params: { name: "1" } });
                expect(res.status).toBe(200);
                expect(res.data).toHaveProperty('products');
                expect(res.data.products).toHaveLength(1);
                expect(res.data.products[0].name).toBe(doc.name);
            });
        });
        describe("Pagination", () => {
            it("should return a list of products with pagination", async () => {
                const category = new Category({
                    parent: null,
                    name: "Category 1",
                    image: "test.jpg",
                });
                await category.save();

                const doc = {
                    ..._doc,

                };

                const product = new Product(doc);
                await product.save();

                await Promise.all(Array(20).fill(0).map((_, i) => Product.create({
                    ...doc,
                    name: `Product ${i + 2}`,
                    approved: true,
                })));
                const res = await http.get('/api/product', { params: { page: 1 } });
                expect(res.status).toBe(200);
                expect(res.data).toHaveProperty('products');
                expect(res.data).toHaveProperty('total');
                expect(res.data).toHaveProperty('next');
                expect(res.data).toHaveProperty('prev');
                expect(res.data.page).toBe(1);
                const products = res.data.products;
                expect(products).toHaveLength(10);
            });
            it("should return empty list if page > total page", async () => {
                const category = new Category({
                    parent: null,
                    name: "Category 1",
                    image: "test.jpg",
                });
                await category.save();

                const doc = {
                    ..._doc,
                    category: category._id,
                };

                const product = new Product(doc);
                await product.save();

                await Promise.all(Array(20).fill(0).map((_, i) => Product.create({
                    ...doc,
                    name: `Product ${i + 2}`,
                })));
                const res = await http.get('/api/product', { params: { page: 4 } });
                expect(res.status).toBe(200);
                expect(res.data).toHaveProperty('products');
                expect(res.data).toHaveProperty('total');
                expect(res.data).toHaveProperty('next');
                expect(res.data).toHaveProperty('prev');
                expect(res.data.page).toBe(4);
                const products = res.data.products;
                expect(products).toHaveLength(0);
            });
        });
        describe("Sorting", () => {
            it.todo("should return a list of products sorted by price");
            it.todo("should return a list of products sorted by name A-Z");
            it.todo("should return a list of products sorted by name Z-A");
            it.todo("should return a list of products sorted by date");
        });
    });
    describe.skip('GET /api/product/:id?', () => {
        describe.skip('GET /api/product/:id', () => {
            describe.skip('When :id is ID', () => { });
        });
    });
    describe('POST /api/product', () => {

        it('should create a product', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "host", resource: "product", action: "create", attributes: ['*', '!verified'], possession: "own" }),
            ]);
            const image = "test/fixtures/image.jpg";
            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
            });
            await category.save();
            const amenity = await Amenity.create({
                name: "Amenity 1",
                image: "icon.jpg",
            });
            const owner = new User({ disabled: false, verified: true, role: "host" });
            jest.spyOn(User, 'findById').mockResolvedValue(owner);
            const doc = {
                ..._doc,
                owner: owner._id.toString(),
                categories: [category._id.toString()],
                amenities: [amenity._id.toString()],
            };
            const formdata = axios.toFormData(doc);
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');

            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');

            // console.log(formdata._streams);
            const res = await http.post('/api/product', formdata, {
                headers: {
                    Authorization: `Bearer ${owner.generateToken()}`,
                }
            });
            // console.log(res.data);
            expect(res.status).toBe(200);

        });

        it('should ignore owner if have createOwn with !owner attribute', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "host", resource: "product", action: "create", attributes: ['*', '!verified', '!owner'], possession: "own" }),
            ]);
            const image = "test/fixtures/image.jpg";
            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
            });
            await category.save();
            const amenity = await Amenity.create({
                name: "Amenity 1",
                image: "icon.jpg",
            });
            const owner = new User({ disabled: false, verified: true, role: "host" });
            jest.spyOn(User, 'findById').mockResolvedValue(owner);
            const doc = {
                ..._doc,
                owner: new ObjectId().toString(),
                categories: [category._id.toString()],
                amenities: [amenity._id.toString()],
            };
            const formdata = axios.toFormData(doc);
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');

            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');

            // console.log(formdata._streams);
            const res = await http.post('/api/product', formdata, {
                headers: {
                    Authorization: `Bearer ${owner.generateToken()}`,
                }
            });
            // console.log(res.data);
            expect(res.status).toBe(200);
            expect(res.data.owner).toBe(owner._id.toString());

        });

        it('should not ignore owner if have createAny', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "host", resource: "product", action: "create", attributes: ['*', '!verified',], possession: "any" }),
            ]);
            const image = "test/fixtures/image.jpg";
            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
            });
            await category.save();
            const amenity = await Amenity.create({
                name: "Amenity 1",
                image: "icon.jpg",
            });
            const owner = new User({ disabled: false, verified: true, role: "host" });
            jest.spyOn(User, 'findById').mockResolvedValue(owner);
            const doc = {
                ..._doc,
                owner: new ObjectId().toString(),
                categories: [category._id.toString()],
                amenities: [amenity._id.toString()],
            };
            const formdata = axios.toFormData(doc);
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');

            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');

            // console.log(formdata._streams);
            const res = await http.post('/api/product', formdata, {
                headers: {
                    Authorization: `Bearer ${owner.generateToken()}`,
                }
            });
            // console.log(res.data);
            expect(res.status).toBe(200);
            expect(res.data.owner).toBe(doc.owner);

        });
        it('should return 400 if owner not provided and if have createAny', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "host", resource: "product", action: "create", attributes: ['*', '!verified',], possession: "any" }),
            ]);
            const image = "test/fixtures/image.jpg";
            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
            });
            await category.save();
            const amenity = await Amenity.create({
                name: "Amenity 1",
                image: "icon.jpg",
            });
            const owner = new User({ disabled: false, verified: true, role: "host" });
            jest.spyOn(User, 'findById').mockResolvedValue(owner);
            const doc = {
                ..._doc,
                owner: undefined,
                categories: [category._id.toString()],
                amenities: [amenity._id.toString()],
            };
            const formdata = axios.toFormData(doc);
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');

            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');

            // console.log(formdata._streams);
            const res = await http.post('/api/product', formdata, {
                headers: {
                    Authorization: `Bearer ${owner.generateToken()}`,
                }
            });
            // console.log(res.data);
            expect(res.status).toBe(400);
            expect(res.data.owner).toBe(doc.owner);

        });

        it('should badrequest if amenities not provided', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "host", resource: "product", action: "create", attributes: ['*', '!verified'], possession: "own" }),
            ]);
            const image = "test/fixtures/image.jpg";
            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
            });
            await category.save();
            const owner = new User({ disabled: false, verified: true, role: "host" });
            jest.spyOn(User, 'findById').mockResolvedValue(owner);
            const doc = {
                ..._doc,
                owner: owner._id.toString(),
                categories: [category._id.toString()],
                // amenities: [amenity._id.toString()],
                amenities: [],
            };
            const formdata = axios.toFormData(doc);
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');

            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');

            // console.log(formdata._streams);
            const res = await http.post('/api/product', formdata, {
                headers: {
                    Authorization: `Bearer ${owner.generateToken()}`,
                }
            });
            // console.log(res.data);
            expect(res.status).toBe(400);

        });

        it('should badrequest if images not provided', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "host", resource: "product", action: "create", attributes: ['*', '!verified'], possession: "own" }),
            ]);
            const image = "test/fixtures/image.jpg";
            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
            });
            await category.save();
            const amenity = await Amenity.create({
                name: "Amenity 1",
                image: "icon.jpg",
            });
            const owner = new User({ disabled: false, verified: true, role: "host" });
            jest.spyOn(User, 'findById').mockResolvedValue(owner);
            const doc = {
                ..._doc,
                owner: owner._id.toString(),
                categories: [category._id.toString()],
                amenities: [amenity._id.toString()],
            };
            const formdata = axios.toFormData(doc);

            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');
            // console.log(formdata._streams);
            const res = await http.post('/api/product', formdata, {
                headers: {
                    Authorization: `Bearer ${owner.generateToken()}`,
                }
            });
            // console.log(res.data);
            expect(res.status).toBe(400);

        });

        it('should badrequest if docs or images not provided', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "host", resource: "product", action: "create", attributes: ['*', '!verified'], possession: "own" }),
            ]);
            const image = "test/fixtures/image.jpg";
            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
            });
            await category.save();
            const amenity = await Amenity.create({
                name: "Amenity 1",
                image: "icon.jpg",
            });
            const owner = new User({ disabled: false, verified: true, role: "host" });
            jest.spyOn(User, 'findById').mockResolvedValue(owner);
            const doc = {
                ..._doc,
                owner: owner._id.toString(),
                categories: [category._id.toString()],
                amenities: [amenity._id.toString()],
            };
            const formdata = axios.toFormData(doc);

            // console.log(formdata._streams);
            const res = await http.post('/api/product', formdata, {
                headers: {
                    Authorization: `Bearer ${owner.generateToken()}`,
                }
            });
            // console.log(res.data);
            expect(res.status).toBe(400);

        });

    });

    describe('PATCH /api/product/:id?', () => {

        it('should update a product', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "host", resource: "product", action: "update", attributes: ['*', '!verified'], possession: "own" }),
            ]);
            const image = "test/fixtures/image.jpg";
            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
            });
            const amenity = await Amenity({
                name: "Amenity 1",
                image: "icon.jpg",
            });

            const owner = new User({ disabled: false, verified: true, role: "host" });
            jest.spyOn(User, 'findById').mockResolvedValue(owner);
            const doc = {
                ..._doc,
                owner: owner._id.toString(),
                categories: [category._id.toString()],
                amenities: [amenity._id.toString()],
            };
            const product = new Product(doc);
            await product.save();
            jest.spyOn(Product, 'findOne').mockResolvedValue(product);
            const formdata = axios.toFormData(doc);
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');

            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');

            // console.log(formdata._streams);
            const res = await http.patch(`/api/product/${product._id}`, formdata, {
                headers: {
                    Authorization: `Bearer ${owner.generateToken()}`,
                }
            });
            // console.log(res.data);
            expect(res.status).toBe(200);

        });
        it('should handle errors', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "host", resource: "product", action: "update", attributes: ['*', '!verified'], possession: "own" }),
            ]);
            const image = "test/fixtures/image.jpg";
            const category = new Category({});
            const amenity = await Amenity({});

            const owner = new User({ disabled: false, verified: true, role: "host" });
            jest.spyOn(User, 'findById').mockResolvedValue(owner);
            const doc = {
                ..._doc,
                owner: owner._id.toString(),
                categories: [category._id.toString()],
                amenities: [amenity._id.toString()],
            };
            const product = new Product(doc);
            await product.save();
            jest.spyOn(Product, 'findOne').mockResolvedValue(product);
            jest.spyOn(Product, 'findOneAndUpdate').mockRejectedValue(new Error("Error"));
            const formdata = axios.toFormData(doc);
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');

            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');

            // console.log(formdata._streams);
            const res = await http.patch(`/api/product/${product._id}`, formdata, {
                headers: {
                    Authorization: `Bearer ${owner.generateToken()}`,
                }
            });
            // console.log(res.data);
            expect(res.status).toBe(500);

        });

        it('should return 404 if id is provided and user is not owner and dont have create createAny permission', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "host", resource: "product", action: "update", attributes: ['*', '!verified'], possession: "own" }),
            ]);
            const image = "test/fixtures/image.jpg";
            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
            });
            await category.save();
            const amenity = await Amenity.create({
                name: "Amenity 1",
                image: "icon.jpg",
            });
            const owner = new User({ disabled: false, verified: true, role: "host" });
            jest.spyOn(User, 'findById').mockResolvedValue(owner);
            const doc = {
                ..._doc,
                owner: new ObjectId().toString(),
                categories: [category._id.toString()],
                amenities: [amenity._id.toString()],
            };
            const product = new Product(doc);
            await product.save();
            const formdata = axios.toFormData(doc);
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');

            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');

            // console.log(formdata._streams);
            const res = await http.patch(`/api/product/${new ObjectId()}`, formdata, {
                headers: {
                    Authorization: `Bearer ${owner.generateToken()}`,
                }
            });
            // console.log(res.data);
            expect(res.status).toBe(404);

        });
        it('should return 404 if id is not in Product collection', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "host", resource: "product", action: "update", attributes: ['*', '!verified'], possession: "own" }),
            ]);
            const image = "test/fixtures/image.jpg";
            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
            });
            await category.save();
            const amenity = await Amenity.create({
                name: "Amenity 1",
                image: "icon.jpg",
            });
            const owner = new User({ disabled: false, verified: true, role: "host" });
            jest.spyOn(User, 'findById').mockResolvedValue(owner);
            const doc = {
                ..._doc,
                owner: owner._id.toString(),
                categories: [category._id.toString()],
                amenities: [amenity._id.toString()],
            };
            const formdata = axios.toFormData(doc);
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');

            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');

            // console.log(formdata._streams);
            const res = await http.patch(`/api/product/${new ObjectId()}`, formdata, {
                headers: {
                    Authorization: `Bearer ${owner.generateToken()}`,
                }
            });
            // console.log(res.data);
            expect(res.status).toBe(404);

        });

        it('should return 400 if images not provided', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "host", resource: "product", action: "update", attributes: ['*', '!verified'], possession: "own" }),
            ]);
            const image = "test/fixtures/image.jpg";
            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
            });
            await category.save();
            const amenity = await Amenity.create({
                name: "Amenity 1",
                image: "icon.jpg",
            });
            const owner = new User({ disabled: false, verified: true, role: "host" });
            jest.spyOn(User, 'findById').mockResolvedValue(owner);
            const doc = {
                ..._doc,
                owner: owner._id.toString(),
                categories: [category._id.toString()],
                amenities: [amenity._id.toString()],
            };
            const product = new Product(doc);
            await product.save();
            const formdata = axios.toFormData({
                ...doc,
                images: [],
            });

            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');

            // console.log(formdata._streams);
            const res = await http.patch(`/api/product/${product._id}`, formdata, {
                headers: {
                    Authorization: `Bearer ${owner.generateToken()}`,
                }
            });
            // console.log(res.data);
            expect(res.status).toBe(400);

        });

        it('should return 400 if docs not provided', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "host", resource: "product", action: "update", attributes: ['*', '!verified'], possession: "own" }),
            ]);
            const image = "test/fixtures/image.jpg";
            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
            });
            await category.save();
            const amenity = await Amenity.create({
                name: "Amenity 1",
                image: "icon.jpg",
            });
            const owner = new User({ disabled: false, verified: true, role: "host" });
            jest.spyOn(User, 'findById').mockResolvedValue(owner);
            const doc = {
                ..._doc,
                owner: owner._id.toString(),
                categories: [category._id.toString()],
                amenities: [amenity._id.toString()],
            };
            const product = new Product(doc);
            await product.save();
            const formdata = axios.toFormData({
                ...doc,
                docs: [],
            });
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');

            // console.log(formdata._streams);
            const res = await http.patch(`/api/product/${product._id}`, formdata, {
                headers: {
                    Authorization: `Bearer ${owner.generateToken()}`,
                }
            });
            // console.log(res.data);
            expect(res.status).toBe(400);

        });

        it('should upsert a product if id is not provided and  draft is true', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "host", resource: "product", action: "update", attributes: ['*', '!verified'], possession: "own" }),
            ]);
            const image = "test/fixtures/image.jpg";
            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
            });
            await category.save();
            const amenity = await Amenity.create({
                name: "Amenity 1",
                image: "icon.jpg",
            });
            const owner = new User({ disabled: false, verified: true, role: "host" });
            jest.spyOn(User, 'findById').mockResolvedValue(owner);
            const doc = {
                ..._doc,
                owner: owner._id.toString(),
                categories: [category._id.toString()],
                amenities: [amenity._id.toString()],
                draft: 1,
            };
            const formdata = axios.toFormData(doc);
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');

            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');

            // console.log(formdata._streams);
            const res = await http.patch(`/api/product`, formdata, {
                headers: {
                    Authorization: `Bearer ${owner.generateToken()}`,
                }
            });
            // console.log(res.data);
            expect(res.status).toBe(200);
            const product = await Product.findById(res.data._id);
            expect(product).not.toBeNull();
            expect(product.draft).toBe(true);

        });
        it('should return 404 if id is not provided and  have createOwn permission', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "host", resource: "product", action: "update", attributes: ['*', '!verified'], possession: "own" }),
            ]);
            const image = "test/fixtures/image.jpg";
            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
            });
            await category.save();
            const amenity = await Amenity.create({
                name: "Amenity 1",
                image: "icon.jpg",
            });
            const owner = new User({ disabled: false, verified: true, role: "host" });
            jest.spyOn(User, 'findById').mockResolvedValue(owner);
            const doc = {
                ..._doc,
                owner: owner._id.toString(),
                categories: [category._id.toString()],
                amenities: [amenity._id.toString()],
            };
            const formdata = axios.toFormData(doc);
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');

            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');

            // console.log(formdata._streams);
            const res = await http.patch(`/api/product`, formdata, {
                headers: {
                    Authorization: `Bearer ${owner.generateToken()}`,
                }
            });
            // console.log(res. data);
            expect(res.status).toBe(404);


        });
        it('should return 404 if id is not provided and  have createAny permission', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "host", resource: "product", action: "update", attributes: ['*', '!verified'], possession: "any" }),
            ]);
            const image = "test/fixtures/image.jpg";
            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
            });
            await category.save();
            const amenity = await Amenity.create({
                name: "Amenity 1",
                image: "icon.jpg",
            });
            const owner = new User({ disabled: false, verified: true, role: "host" });
            jest.spyOn(User, 'findById').mockResolvedValue(owner);
            const doc = {
                ..._doc,
                owner: owner._id.toString(),
                categories: [category._id.toString()],
                amenities: [amenity._id.toString()],
            };
            const formdata = axios.toFormData(doc);
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');

            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');

            // console.log(formdata._streams);
            const res = await http.patch(`/api/product`, formdata, {
                headers: {
                    Authorization: `Bearer ${owner.generateToken()}`,
                }
            });
            // console.log(res.data);
            expect(res.status).toBe(404);


        });
        it('should return 200 if id is not provided and have createAny permission and draft is true', async () => {
            jest.spyOn(Grant, 'find').mockResolvedValue([
                new Grant({ role: "host", resource: "product", action: "update", attributes: ['*', '!verified'], possession: "any" }),
            ]);
            const image = "test/fixtures/image.jpg";
            const category = new Category({
                parent: null,
                name: "Category 1",
                image: "test.jpg",
            });
            await category.save();
            const amenity = await Amenity.create({
                name: "Amenity 1",
                image: "icon.jpg",
            });
            const owner = new User({ disabled: false, verified: true, role: "host" });
            jest.spyOn(User, 'findById').mockResolvedValue(owner);
            const doc = {
                ..._doc,
                owner: owner._id.toString(),
                categories: [category._id.toString()],
                amenities: [amenity._id.toString()],
                draft: 1,
            };
            const formdata = axios.toFormData(doc);
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('images[]', fs.createReadStream(image), 'image.jpg');

            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');
            formdata.append('docs[]', fs.createReadStream(image), 'image.jpg');

            // console.log(formdata._streams);
            const res = await http.patch(`/api/product`, formdata, {
                headers: {
                    Authorization: `Bearer ${owner.generateToken()}`,
                }
            });
            // console.log(res.data);
            expect(res.status).toBe(200);

            const product = await Product.findById(res.data._id);
            expect(product).not.toBeNull();
            expect(product.draft).toBe(true);


        });



    });

    describe.skip('PATCH /api/product/:id', () => { });
    describe.skip('DELETE /api/product/:id', () => { });
});

