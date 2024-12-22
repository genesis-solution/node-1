const { Schema, model } = require('mongoose');
const { autoincrement } = require('./Sequence');

function required() {
    return !(this.user || this.contact); // NOR
}

const SupportSchema = new Schema({
    id: String,
    title: { type: String, required: true },
    description: { type: String, required: true },

    type: {
        type: String,
        enum: ['technical', 'other'],
        default: 'other',
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved'],
        default: 'open',
        required: true
    },
    priority: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    },
    reference: { type: String },
    screenshots: [{ type: String }],

    user: { type: Schema.Types.ObjectId, ref: 'User', required, },
    contact: { type: String, required, },

}, { timestamps: true });

SupportSchema.plugin(autoincrement('id', null, (id) => `SPT${id.toString().padStart(6, '0')}`)); // SUP000001

const Support = model('Support', SupportSchema);
module.exports = Support;