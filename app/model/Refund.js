const mongoose = require('mongoose');
const { autoincrement } = require('./Sequence');
const refundSchema = new mongoose.Schema({
    id: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    cancelation: { type: mongoose.Schema.Types.ObjectId, ref: 'Cancelation', required: true },
    approved: { type: Boolean, default: false },
}, { timestamps: true });

refundSchema.plugin(autoincrement('id', null, (id) => `RF${id.toString().padStart(6, '0')}`)); // RF000001
const Refund = mongoose.model('Refund', refundSchema);
module.exports = Refund;