const { connect } = require('../../app/config/database');
const Cancelation = require('../../app/model/Cancelation');
const Order = require('../../app/model/Order');
const Refund = require('../../app/model/Refund');
const User = require('../../app/model/User');
const prepareOrder = require('../fixtures/prepareOrder');

describe('Model - Cancelation', () => {
    let connection;
    beforeAll(async () => {
        connection = await connect('test-can-model');
        await prepareOrder();
    });
    afterAll(async () => {
        await connection.disconnect();
    });
    afterEach(async () => {
        await Cancelation.deleteMany({});
    });

    it('should create a cancelation', async () => {
        const order = await Order.findOne({});
        const user = await User.findOne({});
        const reasons = [
            'Out of stock',
            'Order by mistake',
            'Price is high',
            'Wrong Address',
            'Other',
        ];
        const reason = reasons[Math.floor(Math.random() * reasons.length)];
        const note = 'note';
        const cancelation = new Cancelation({
            user,
            reason,
            note,
            order,
            approved: false,
            rejectionNote: 'rejectionNote',
        });
        await cancelation.save();
        const found = await Cancelation.findById(cancelation._id);
        expect(found._id).toEqual(cancelation._id);
        expect(found.user).toEqual(cancelation.user._id);
        expect(found.reason).toEqual(cancelation.reason);
        expect(found.order).toEqual(cancelation.order._id);
        expect(found.approved).toEqual(cancelation.approved);
        expect(found.note).toEqual(cancelation.note);
        expect(found.rejectionNote).toEqual(cancelation.rejectionNote);
        expect(found.id).toBeDefined();
        expect(found.createdAt).toBeDefined();
        expect(found.updatedAt).toBeDefined();
    });
    it('should update a cancelation', async () => {
        const order = await Order.findOne({});
        const user = await User.findOne({});

        const note = 'note';
        const cancelation = new Cancelation({
            user,
            note,
            order,
            approved: false,
        });
        await cancelation.save();
        cancelation.approved = true;
        await cancelation.save();
        const found = await Cancelation.findById(cancelation._id);
        expect(found.approved).toEqual(true);
    });
    it('should update a cancelation with refund', async () => {
        const order = await Order.findOne({});
        const user = await User.findOne({});

        const note = 'note';
        const cancelation = new Cancelation({
            user,
            note,
            order,
            approved: false,
        });
        await cancelation.save();
        cancelation.approved = true;
        const refund = new Refund({
            user,
            amount: 100,
            order,
            cancelation,
            approved: false,
        });
        await refund.save();
        cancelation.refund = refund._id;
        await cancelation.save();
        const found = await Cancelation.findById(cancelation._id);
        expect(found.approved).toEqual(true);
        expect(found.refund).toEqual(refund._id);
    });
    it('should not have cancelation reason other than predefined', async () => {
        const order = await Order.findOne({});
        const user = await User.findOne({});
        const reason = 'Invalid Reason';
        const note = 'note';
        const cancelation = new Cancelation({
            user,
            reason,
            note,
            order,
            approved: false,
        });
        let error;
        try {
            await cancelation.save();
        } catch (e) {
            error = e;
        }
        expect(error).toBeDefined();
    });
});