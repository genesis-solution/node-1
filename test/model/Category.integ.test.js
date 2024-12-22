const Category = require('../../app/model/Category');
const mongoose = require('mongoose');
const database = require('../../app/config/database');
const Sequence = require('../../app/model/Sequence').Sequence;
const mongodb = require('mongodb');
const debug = require('debug')('app:test:model:category');


describe('Category integration test', () => {
    beforeAll(async () => {
        await database.connect('testcatefory');

    });

    beforeEach(async () => {
        await Category.deleteMany({});
        await Sequence.deleteMany({});
    });

    afterAll(async () => {
        await Category.deleteMany({});
        await Sequence.deleteMany({});
        await mongoose.connection.close();
    });

    it("should create a new category", async () => {
        const _doc = { name: "Category 1", image: "image1.jpg", banner: "BannerImage.jpg"}
        const category = new Category(_doc);
        await category.save();
        const result = await Category.find({});
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe(_doc.name);
        expect(result[0].image).toBe(_doc.image);
        expect(result[0].banner).toBe(_doc.banner);
    });

    it("should not create a new category without name", async () => {
        const category = new Category({ image: "image1.jpg" });
        expect(category.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });
    it("should not create a new category without image", async () => {
        const category = new Category({ name: "Category 1" });
        expect(category.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should not create a new category without name and image", async () => {
        const category = new Category({});
        expect(category.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should not create a new category with duplicate name", async () => {
        const category1 = new Category({ name: "Category 1", image: "image1.jpg" });
        const category2 = new Category({ name: "Category 1", image: "image2.jpg" });
        await category1.save();
        await expect(category2.save()).rejects.toThrow("E11000 duplicate key error collection: testcatefory.categories index: name_1 dup key: { name: \"Category 1\" }");
    });

    it("should contain properties _id, name, image, id", async () => {
        const category = new Category({ name: "Category 2", image: "image1.jpg" });
        await category.save();
        const result = await Category.findOne({});
        expect(result).toHaveProperty("_id");
        expect(result).toHaveProperty("name");
        expect(result).toHaveProperty("image");
        expect(result).toHaveProperty("id");
    });

    describe("sub Category", () => {
        it("should create a new sub category", async () => {
            const category = new Category({ name: "Category 1", image: "image1.jpg" });
            await category.save();
            const subCategory = new Category({ name: "Sub Category 1", image: "image2.jpg", parent: category._id });
            await subCategory.save();
            const result = await Category.findOne({ _id: subCategory._id });
            expect(result.name).toBe("Sub Category 1");
            expect(result).toHaveProperty("parent");
            expect(result.parent).toMatchObject(category._id);
            expect(result).toHaveProperty("name");
            expect(result).toHaveProperty("image");
            expect(result).toHaveProperty("id");
        });

        it("should add child category to parent category on save", async () => {
            const category = new Category({ name: "Category 1", image: "image1.jpg" });
            await category.save();
            const subCategory = new Category({ name: "Sub Category 1", image: "image2.jpg", parent: category._id });
            await subCategory.save();
            const result = await Category.findOne({ _id: category._id });
            expect(result.categories).toHaveLength(1);
            expect(result.categories[0]).toMatchObject(subCategory._id);
        });

        it("should remove child category from parent category on deleteOne", async () => {
            const category = new Category({ name: "Category 1", image: "image1.jpg" });
            await category.save();
            const subCategory = new Category({ name: "Sub Category 1", image: "image2.jpg", parent: category._id });
            await subCategory.save();
            await Category.deleteOne({ _id: subCategory._id });
            const result = await Category.findOne({ _id: category._id });
            expect(result.categories).toHaveLength(0);
        });
        it("should not fail if parent category is not found on deleteOne", async () => {
            const category = new Category({ name: "Category 1", image: "image1.jpg" });
            await category.save();
            const subCategory = new Category({ name: "Sub Category 1", image: "image2.jpg", parent: category._id });
            await subCategory.save();
            await Category.deleteOne({ _id: category._id });
            const result = await Category.findOne({ _id: subCategory._id });
            expect(result).not.toBeNull();
            expect(result.parent).toBeTruthy(); // orphaned category
        });

        it("should populate the parent category", async () => {
            const category = new Category({ name: "Category 1", image: "image1.jpg" });
            await category.save();
            const subCategory = new Category({ name: "Sub Category 1", image: "image2.jpg", parent: category._id });
            await subCategory.save();
            const result = await Category.findOne({ _id: subCategory._id }).populate("parent");
            expect(result.parent.name).toBe(category.name);
            expect(result.parent.image).toBe(category.image);
            expect(result.parent.id).toBe(category.id);
        });
    });

    describe("Category findGrouped", () => {
        it("should return empty array if no category", async () => {
            const result = await Category.findGrouped();
            expect(result).toHaveLength(0);
        });

        it("should return a single category if no sub category", async () => {
            const category = new Category({ name: "Category 1", image: "image1.jpg" });
            await category.save();
            const result = await Category.findGrouped();
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe("Category 1");
            expect(result[0].image).toBe("image1.jpg");
            expect(result[0].id).toBe(1);
            expect(result[0].categories).toHaveLength(0);
        });

        it("should return a single category with sub category", async () => {
            const category = new Category({ name: "Category 1", image: "image1.jpg" });
            await category.save();
            const subCategory = new Category({ name: "Sub Category 1", image: "image2.jpg", parent: category._id });
            await subCategory.save();
            const result = await Category.findGrouped();
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe("Category 1");
            expect(result[0].image).toBe("image1.jpg");
            expect(result[0].id).toBe(1);
            expect(result[0].categories).toHaveLength(1);
            expect(result[0].categories[0].name).toBe("Sub Category 1");
            expect(result[0].categories[0].image).toBe("image2.jpg");
            expect(result[0].categories[0].id).toBe(2);
            expect(result[0].categories[0].parent).toMatchObject(category._id);
        });
        it("should return multiple categories with sub category", async () => {
            const category1 = new Category({ name: "Category 1", image: "image1.jpg" });
            const category2 = new Category({ name: "Category 2", image: "image2.jpg" });
            await category1.save();
            await category2.save();

            const subCategory1 = new Category({ name: "Sub Category 1", image: "image3.jpg", parent: category1._id });
            const subCategory2 = new Category({ name: "Sub Category 2", image: "image4.jpg", parent: category2._id });
            await subCategory1.save();
            await subCategory2.save();

            const result = await Category.findGrouped();
            expect(result).toHaveLength(2);
            expect(result.find(c => c.name === "Category 1").categories).toHaveLength(1);
            expect(result.find(c => c.name === "Category 2").categories).toHaveLength(1);
            expect(result.find(c => c.name === "Category 1").categories.find(c => c.name === "Sub Category 1")).toMatchObject(subCategory1.toObject());
            expect(result.find(c => c.name === "Category 2").categories.find(c => c.name === "Sub Category 2")).toMatchObject(subCategory2.toObject());
            expect(result.find(c => c.name === "Category 1").categories.some(c => c.id === 3)).toBe(true);
            expect(result.find(c => c.name === "Category 2").categories.some(c => c.id === 4)).toBe(true);


        });

        it("should return multiple categories with multiple sub category", async () => {
            /**
                Electronics
                    - Phones
                        - Smartphones
                            - Android
                            - iOS
                        - Feature Phones
                    - Computers
                        - Laptops
                        - Desktops
                            - Gaming Desktops
             */
            const electronics = new Category({ name: "Electronics", image: "electronics.jpg" });
            await electronics.save();
            const phones = new Category({ name: "Phones", image: "phones.jpg", parent: electronics._id });
            await phones.save();
            const smartphones = new Category({ name: "Smartphones", image: "smartphones.jpg", parent: phones._id });
            await smartphones.save();
            const android = new Category({ name: "Android", image: "android.jpg", parent: smartphones._id });
            await android.save();
            const ios = new Category({ name: "iOS", image: "ios.jpg", parent: smartphones._id });
            await ios.save();
            const featurePhones = new Category({ name: "Feature Phones", image: "feature-phones.jpg", parent: phones._id });
            await featurePhones.save();
            const computers = new Category({ name: "Computers", image: "computers.jpg", parent: electronics._id });
            await computers.save();
            const laptops = new Category({ name: "Laptops", image: "laptops.jpg", parent: computers._id });
            await laptops.save();
            const desktops = new Category({ name: "Desktops", image: "desktops.jpg", parent: computers._id });
            await desktops.save();
            const gamingDesktops = new Category({ name: "Gaming Desktops", image: "gaming-desktops.jpg", parent: desktops._id });
            await gamingDesktops.save();


            const result = await Category.findGrouped();
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe("Electronics");
            expect(result[0].image).toBe("electronics.jpg");
            expect(result[0].id).toBe(1);
            expect(result[0].categories).toHaveLength(2);
            const phonesResult = result[0].categories.find(c => c.name === "Phones");
            expect(phonesResult.categories).toHaveLength(2);
            expect(phonesResult.categories.find(c => c.name === "Smartphones").categories).toHaveLength(2);
            expect(phonesResult.categories.find(c => c.name === "Feature Phones").categories).toHaveLength(0);
            const computersResult = result[0].categories.find(c => c.name === "Computers");
            expect(computersResult.categories).toHaveLength(2);
            expect(computersResult.categories.find(c => c.name === "Laptops").categories).toHaveLength(0);
            expect(computersResult.categories.find(c => c.name === "Desktops").categories).toHaveLength(1);
            expect(computersResult.categories.find(c => c.name === "Desktops").categories.find(c => c.name === "Gaming Desktops").categories).toHaveLength(0);
            expect(phonesResult.categories.find(c => c.name === "Smartphones").categories.find(c => c.name === "Android")).toMatchObject(android.toObject());
            expect(phonesResult.categories.find(c => c.name === "Smartphones").categories.find(c => c.name === "iOS")).toMatchObject(ios.toObject());
            expect(phonesResult.categories.find(c => c.name === "Feature Phones")).toMatchObject(featurePhones.toObject());
        });
    });

    describe("Category increment id", () => {
        it("should create a new category with increamental id", async () => {
            const category1 = new Category({ name: "Category 1", image: "image1.jpg" });
            const category2 = new Category({ name: "Category 2", image: "image2.jpg" });
            await category1.save();
            await category2.save();
            const result = await Category.find({});
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe(1);
            expect(result[1].id).toBe(2);
        });

        it("should not increament id if it is already set", async () => {
            const category1 = new Category({ name: "Category 1", image: "image1.jpg", id: 100 });
            await category1.save();
            const result = await Category.find({});
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(100);
        });

        it("should not increment the id on updateOne", async () => {
            const category = new Category({ name: "Category 1", image: "image1.jpg" });
            await category.save();

            category.image = "image2.jpg";
            await category.save();
            const result1 = await Category.find({});
            expect(result1).toHaveLength(1);
            expect(result1[0].id).toBe(1);

            const result = await Category.updateOne({ _id: category._id }, { image: "image3.jpg" });
            expect(result.modifiedCount).toBe(1);
            const updatedCategory = await Category.findOne({ _id: category._id });
            expect(updatedCategory.id).toBe(1);
        });

        it("should not increment the id on findOneAndUpdate", async () => {
            const category = new Category({ name: "Category 1", image: "image1.jpg" });
            await category.save();

            category.image = "image2.jpg";
            await category.save();
            const result1 = await Category.find({});
            expect(result1).toHaveLength(1);
            expect(result1[0].id).toBe(1);

            const result = await Category.findOneAndUpdate({ _id: category._id }, { image: "image3.jpg" });
            expect(result.id).toBe(1);
        });

        it("should not create a new category without name", async () => {
            const category = new Category({ image: "image1.jpg" });
            let error;
            try {
                await category.save();
            } catch (e) {
                error = e;
            }
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        });
    });

});
