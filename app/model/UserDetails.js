const { model, Schema } = require('mongoose');

const userDetailsSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    // salutation: String,
    // firstName: String,
    // lastName: String,
    // phone: String,
    // address: String,
    // state: String,
    // zip: Number,
    // city: String,
    salutation: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    zip: {
        type: Number,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        default: "United States"
    },
});

userDetailsSchema.index({ user: 1 }, { unique: true });

const UserDetails = model('UserDetails', userDetailsSchema);
module.exports = UserDetails;