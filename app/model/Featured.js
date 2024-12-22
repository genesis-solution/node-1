const { Schema, model } = require('mongoose');

const featuredSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true

    }
});

const Featured = model('Featured', featuredSchema);
module.exports = Featured;

