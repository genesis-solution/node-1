const Amenity = require("../../app/model/Amenity");
const Category = require("../../app/model/Category");
const Order = require("../../app/model/Order");
const Product = require("../../app/model/Product");
const User = require("../../app/model/User");

module.exports = async function prepareOrder() {
    const _doc = {
        id: undefined,

        owner: new User(),

        draft: undefined,
        approved: undefined,
        hidden: undefined,

        docs: ['test.jpg'],
        images: ['test.jpg'],

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
    const category = new Category({ name: "Category 1", image: "test.jpg" });
    _doc.categories = [category];

    const user = new User({ name: "User 1", email: "test@test.com", password: "password", verified: true, disabled: false });
    const product = new Product({ ..._doc });
    product.owner = user;
    const product2 = new Product({ ..._doc, name: "Product 2" });
    product2.owner = user;
    await Promise.all([category.save(), product.save(), product2.save(), user.save()]);
    const order = await Order.create({
        products: [{ product: product._id, quantity: 1, amount: 100, guests: 1, owner: product.owner }],
        rent: {
            start: new Date(),
            end: new Date(new Date().getTime() + 1000 * 60 * 60)
        },
        amount: 100,
        user,
    });
    return order;
};
