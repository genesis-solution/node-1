const { Schema, model } = require('mongoose');
const { autoincrement } = require('./Sequence');

const PayoutSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled', 'rejected'],
        default: 'pending',
    },
    note: {
        type: String,
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    id: String,
},
    {
        timestamps: true,
        toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
        toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
    }
);
PayoutSchema.virtual('cancelation', {
    ref: 'Cancelation',
    localField: 'order',
    foreignField: 'order',
    justOne: true,
});

PayoutSchema.virtual('refund', {
    ref: 'Refund',
    localField: 'order',
    foreignField: 'order',
    justOne: true,
});

PayoutSchema.plugin(autoincrement('id', null, (id) => `PT${id.toString().padStart(6, '0')}`)); // PT000001
const Payout = model('Payout', PayoutSchema);
module.exports = Payout;