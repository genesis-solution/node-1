const Order = require("../../app/model/Order");
const User = require("../../app/model/User");
const prepareOrder = require("../fixtures/prepareOrder");
const Refund = require("../../app/model/Refund");
const { connect } = require("../../app/config/database");
const Cancelation = require("../../app/model/Cancelation");

describe('Model - Refund', () => {
    let connection;
    beforeAll(async () => {
        connection = await connect('test-ref-model');
        await prepareOrder();
    });
    afterAll(async () => {
        await connection.disconnect();
    });
    afterEach(async () => {
        await Refund.deleteMany({});
    });

    it('should create a refund', async () => {
        const order = await Order.findOne({});
        const user = await User.findOne({});

        const cancelation = new Cancelation({
            user,
            note: 'note',
            order,
            approved: false,
        });
        await cancelation.save();
        const amount = 100;
        const refund = new Refund({
            user,
            amount,
            order,
            cancelation,
            approved: false,
        });
        await refund.save();
        const found = await Refund.findById(refund._id);
        expect(found._id).toEqual(refund._id);
        expect(found.user).toEqual(refund.user._id);
        expect(found.amount).toEqual(refund.amount);
        expect(found.order).toEqual(refund.order._id);
        expect(found.approved).toEqual(refund.approved);
        expect(found.id).toBeDefined();
        expect(found.createdAt).toBeDefined();
        expect(found.updatedAt).toBeDefined();
    });
    it('should update a refund', async () => {
        const order = await Order.findOne({});
        const user = await User.findOne({});
        const cancelation = new Cancelation({
            user,
            note: 'note',
            order,
            approved: false,
        });
        await cancelation.save();
        const amount = 100;
        const refund = new Refund({
            user,
            amount,
            order,
            cancelation,
            approved: false,
        });
        await refund.save();
        refund.approved = true;
        await refund.save();
        const found = await Refund.findById(refund._id);
        expect(found.approved).toEqual(true);
    });
});