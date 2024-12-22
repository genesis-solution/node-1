const mongoose = require('mongoose');
const { autoincrement } = require('./Sequence');
const Schema = mongoose.Schema;
const verbose = require('debug')('verbose:app:model:Discount');

function required() {
    return !this.code ^ !this.products?.length ^ !this.categories?.length;
}

const DiscountSchema = new Schema({
    code: {
        type: String,
        required,
        unique: true,
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required,
    }],
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required,
    }],
    type: {
        type: String,
        enum: ['percentage', 'fixed', 'flat'],
        required: true,
    },
    value: {
        type: Number,
        required: true,
    },
    valid: {
        from: {
            type: Date,
            default: Date.now,
            required: true,
        },
        to: {
            type: Date,
            required: true,
        },
    },
    id: Number,
    min: {
        type: Number,
        default: 0,
    },
    description: String,
}, { timestamps: true });

DiscountSchema.methods.isValid = function () {
    const now = new Date().getTime();
    return now >= this.valid.from.getTime() && now <= this.valid.to.getTime();
};

DiscountSchema.methods.isApplicable = function (product) {
    if (this.products.length > 0 && product?._id) {
        return this.products.some(p => product._id.equals(p));
    }
    if (this.categories.length) {
        return this.categories.some(category => product.categories.some(c => c._id.equals(category._id)));
    }
    return true;
};

/**
 * Calculate the discount
 * @param {number} amount 
 */
DiscountSchema.methods.calculate = function (amount) {
    if (!this.isValid()) {
        return 0;
    }
    if (this.min > amount) {
        return 0;
    }

    switch (this.type) {
        case 'percentage':
            return (this.value / 100) * amount;
        case 'fixed':
            // if the discount is 200, after amount - calculate() the amount should be 200
            return amount - this.value;
        case 'flat':
            verbose('Flat discount', this.value, amount);
            const result = this.value > amount
                ? amount
                : this.value === amount
                    ? 0
                    : this.value;
            verbose('Flat discount result', result);
            return result;
        default:
            return 0;
    }
};

DiscountSchema.plugin(autoincrement('id'));
DiscountSchema.index({ code: 1, valid: 1 }, { partialFilterExpression: { code: { $exists: true } } });

const Discount = mongoose.model('Discount', DiscountSchema);
module.exports = Discount;
