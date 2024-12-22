const mongoose = require('mongoose');

const orderConfigSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    blocked: {
        start: { type: Date, requred: true },
        end: { type: Date, requred: true },
    },
})

const OrderConfig = mongoose.model('OrderConfig', orderConfigSchema);
module.exports = OrderConfig;