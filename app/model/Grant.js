//@ts-check
const mongoose = require('mongoose');

const resources = /** @type {const} @readonly */ ([
    'cancelation',
    'user',
    'category',
    'grant',
    'checkout',
    'review',
    'product',
    'product/images',
    'product/docs',
    'support',
    'notification',
    'report',
    'chargeRate',
    'cart',
    'banner',
    'amenity',
    'userDetails',
    'bankAccount',
    'geo',
    'chat',
    'order',
    'order/config',
    'payout',
    'refund',
    'ledger',
    'testimonial',
    'dashboard',
    'discount',
    'intro',
    'feature',
]);

/** @type {'create' | 'read' | 'update' | 'delete'} */
let typeAction;

/** @type {'own' | 'any'} */
let typePossession;

/** @type {resources[number]} */
let typeResource;


/** @type {{role: string, resource: typeResource, action: typeAction, possession: typePossession, attributes: string[]}} */
let typeGrant;

const grantSchema = new mongoose.Schema({
    role: { type: String, required: true, },
    resource: ({ type: String, enum: resources, required: true }),
    action: {
        type: String,
        enum: ['create', 'read', 'update', 'delete'],
        required: true,
    },
    possession: {
        type: String,
        enum: ['own', 'any'],
        required: true,
    },
    attributes: { type: [String], required: true, default: /** denied */[] },
});


grantSchema.index({ role: 1, resource: 1, action: 1, possession: 1 }, { unique: true });
const Grant = mongoose.model('Grant', grantSchema);
module.exports = {
    /** @type {Partial<{[key in typeResource]: string}>} */
    resources: Object.fromEntries(resources.map(resource => [resource, resource])),
    Grant,
    typeResource,
}

