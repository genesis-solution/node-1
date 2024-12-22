const mongoose = require('mongoose');
const { autoincrement } = require('./Sequence');
const reasons = [
    'Out of stock',
    'Order by mistake',
    'Price is high',
    'Wrong Address',
    "Change in plans",
    "Sudden travel restrictions",
    "Booking error",
    "Unforeseen circumstances",
    "Health concerns",
    "Weather-related issues",
    "Venue availability changed",
    "Event cancellation",
    "Personal emergencies",
    "Found a better option",
    'Other',
];
const cancelationSchema = new mongoose.Schema({
    id: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, enum: reasons, required: true, default: 'Other' },
    note: { type: String, required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    approved: { type: Boolean, default: false },
    refund: { type: mongoose.Schema.Types.ObjectId, ref: 'Refund' },
    rejectionNote: { type: String },
    policy: {
        type: String,
        enum: ['Full refund', 'Partial refund', 'No refund'],
    }
}, { timestamps: true });

cancelationSchema.plugin(autoincrement('id', null, (id) => `CAN${id.toString().padStart(6, '0')}`)); // C000001
const Cancelation = mongoose.model('Cancelation', cancelationSchema);
module.exports = Cancelation;