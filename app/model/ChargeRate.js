const { Schema, model } = require('mongoose');

const chargeRateSchema = new Schema({
    country: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    taxRate: {
        type: Number,
        required: true
    },
    serviceFee: {
        type: Number,
        required: true
    },

});

const ChargeRate = model('ChargeRate', chargeRateSchema);
module.exports = ChargeRate;