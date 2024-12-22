const { Schema, model } = require('mongoose');
const { autoincrement } = require('./Sequence');

const LedgerSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true,
    },
    id: Number,
},
    {
        timestamps: true,
        toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
        toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
    }
);
LedgerSchema.virtual('cancelation', {
    ref: 'Cancelation',
    localField: 'order',
    foreignField: 'order',
    justOne: true,
});

LedgerSchema.virtual('refund', {
    ref: 'Refund',
    localField: 'order',
    foreignField: 'order',
    justOne: true,
});

LedgerSchema.virtual('payouts', {
    ref: 'Payout',
    localField: 'user',
    foreignField: 'user',
});

LedgerSchema.plugin(autoincrement());
const Ledger = model('Ledger', LedgerSchema);
module.exports = Ledger;