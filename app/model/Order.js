const mongoose = require('mongoose');
const { autoincrement } = require('../../app/model/Sequence');

const OrderSchema = new mongoose.Schema({
    id: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            owner: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            tax: {
                type: Number,
                // required: true,
            },
            serviceFee: {
                type: Number,
                // required: true,
            },
            amount: {
                type: Number,
                required: true,
            },
            guests: {
                type: Number,
                required: true,
            },
            discount: {
                type: Number,
                required: true,
                default: 0,
            },

        },
    ],
    rent: {
        start: {
            type: Date,
            required: true,
        },
        end: {
            type: Date,
            required: true,
        },
    },
    transection: {
        status: {
            type: String,
            enum: ['pending', 'completed', 'cancelled', 'failed'],
            default: 'pending',
        },
        id: String,
        gateway: String,
        metadata: {},
    },
    amount: Number,
    discounts: Map,
    charges: Map,
    status: {
        type: String,
        enum: ['payment required', 'pending', 'confirmed', 'processing', 'cancelled', 'failed', 'out of stock',],
        default: 'payment required',
    },
    metadata: {},
}, { timestamps: true });

OrderSchema.plugin(autoincrement('id', null, (id) => `BK${id.toString().padStart(6, '0')}`)); // BK000001

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;

