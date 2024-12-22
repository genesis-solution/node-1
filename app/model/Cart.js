const { Schema, model } = require('mongoose');

const CartSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 }
});

const Cart = model('Cart', CartSchema);
module.exports = Cart;