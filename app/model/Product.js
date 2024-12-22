const debug = require('debug')("app:model:Product");
const mongoose = require('mongoose');
const Category = require('./Category');
const Review = require('./Review');
const pointSchema = require('./schema/Point');
const Amenity = require('./Amenity');
const User = require('./User');
const autoincrement = require('./Sequence').autoincrement;
const Schema = mongoose.Schema;

const _9_AM = new Date(0, 0, 0, 9, 0, 0); // 10 AM
const _9_PM = new Date(0, 0, 0, 21, 0, 0); // 9 PM

function required() {
    const draft = this.draft ?? this._update?.$set?.draft;
    return !draft;
}

const isNotEmpty = [
    function (val) {
        const _required = required.bind(this)();
        return _required ? val?.length : true;
    },
    '{PATH} should not be empty'
];

const productSchema = new Schema({
    id: String,
    owner: { type: Schema.Types.ObjectId, ref: 'User', required },

    draft: { type: Boolean, default: false },
    approved: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    viewsdetails: [{
         view: { type: Number, default: 0 },
         createdAt: { type: Date, default: Date.now },
    }],

    docs: {
        type: [{ type: String }],
        validate: isNotEmpty,
    },
    images: {
        type: [{ type: String }],
        validate: isNotEmpty,
    },
    name: { type: String, required, min: 3, max: 255, },
    description: { type: String, required, min: 3, max: 2000 },

    price: { type: Number, required, min: 0 },
    maxCapacity: { type: Number, required, min: 1 },
    area: { type: Number, required, min: 1 },

    amenities: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Amenity' }],
        validate: isNotEmpty,
    },
    categories: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Category', required }],
        validate: isNotEmpty,
    },
    location: {
        location: {
            type: pointSchema,
            required,
            _id: false,
        },
        address: { type: String, },
        road: { type: String, },
        zipCode: { type: String, },
        city: { type: String, },
        state: { type: String, default: 'Connecticut' },
        country: { type: String, default: 'United States' },
        _id: false,
    },

    type: { type: String, enum: ['indoor', 'outdoor'], default: 'indoor' },

    availability: {
        Sunday: {
            open: { type: Date, default: _9_AM },
            close: { type: Date, default: _9_PM },
            holiday: { type: Boolean, default: false },
        },
        Monday: {
            open: { type: Date, default: _9_AM },
            close: { type: Date, default: _9_PM },
            holiday: { type: Boolean, default: false },
        },
        Tuesday: {
            open: { type: Date, default: _9_AM },
            close: { type: Date, default: _9_PM },
            holiday: { type: Boolean, default: false },
        },
        Wednesday: {
            open: { type: Date, default: _9_AM },
            close: { type: Date, default: _9_PM },
            holiday: { type: Boolean, default: false },
        },
        Thursday: {
            open: { type: Date, default: _9_AM },
            close: { type: Date, default: _9_PM },
            holiday: { type: Boolean, default: false },
        },
        Friday: {
            open: { type: Date, default: _9_AM },
            close: { type: Date, default: _9_PM },
            holiday: { type: Boolean, default: false },
        },
        Saturday: {
            open: { type: Date, default: _9_AM },
            close: { type: Date, default: _9_PM },
            holiday: { type: Boolean, default: false },
        },
    },
    rules: [{ type: String, min: 3, max: 255 }],
   

}, { timestamps: true });

const _log = (result) => {
    debug("Result", result);
    return result;
};

/**
 * 
 * @param {{
 *  categories: Array<mongoose.Types.ObjectId | string>
 * }} query 
 * @param {{
 * limit: number,
 * skip: number,
 * sorting: { [key: string]: 1 | -1 }
 * }} options Limit and Skip
 * @returns 
 */
productSchema.statics.fetch = async function (query = {}, options = {}) {
    const cond = [
        { _id: { $exists: true } }
    ];
    if (Object.keys(query).length > 0) {
        const categories = (query.categories ?? [])
            .map(e => e.toString())
            .map(c => new mongoose.Types.ObjectId(c));
        delete query.categories;
        cond.push(query);
        if (categories.length > 0) {
            cond.push({ categories: { $in: categories } });
        }

    }
    const date = query.date;
    if (date) {
        const day = new Date(date).getDay();
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
        console.log({ [`availability.${dayName}.holiday`]: false });
        delete query.date;
        cond.push({ [`availability.${dayName}.holiday`]: false });
    }

    // console.log({ cond });


    const pipeline = [
        {
            $match: { $and: cond }
        },
        {
            $lookup: {
                from: 'reviews',
                localField: '_id',
                foreignField: 'target',
                as: 'reviews'
            }
        },

        {
            $addFields: {
                average_rating: { $avg: '$reviews.rating' },
                review_count: { $size: '$reviews' }
            }
        },
        {
            $project: {
                reviews: 0
            }
        },
    ];
    if (date) {
        const start = new Date(date);
        const end = new Date(date);
        const FETCH_DAYS = 15;
        end.setDate(end.getDate() + FETCH_DAYS);

        pipeline.push({
            $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'products.product',
                as: 'orders',
                pipeline: [
                    {
                        $match: {
                            status: 'confirmed',
                            $and: [
                                {
                                    "rent.end": { $lt: end }
                                },
                                {
                                    'rent.start': { $gte: start }
                                }
                            ]
                        }
                    },
                    {
                        $sort: { 'rent.start': 1 }
                    },
                    {
                        $project: {
                            rent: 1,
                            _id: 0
                        }
                    }
                ],
            },
        });

        pipeline.push({
            $lookup: {
                from: 'orderconfigs',
                localField: 'owner',
                foreignField: 'user',
                as: 'orderconfigs',
                pipeline: [
                    {
                        $match: {
                            $and: [
                                { "blocked.start": { $ne: null } },
                                { "blocked.end": { $ne: null } },
                            ]
                        }
                    },
                    {
                        $project: {
                            blocked: 1,
                            // user: 0,
                            _id: 0
                        }
                    }
                ],
            },
        });

        pipeline.push({
            $addFields: {
                orders: {
                    $cond: {
                        if: { $ne: ["$orderconfigs.blocked", [] ] },
                        then: {
                            $concatArrays: [
                                "$orders",
                                [{ "rent": { "$first": "$orderconfigs.blocked" } }]
                            ]
                        },
                        else: "$orders"
                    }

                }
            }
        })
    }

    if (options.skip) {
        pipeline.push({ $skip: options.skip });
    }
    if (options.limit) {
        pipeline.push({ $limit: options.limit });
    }
    if (Object.keys(options.sorting ?? {}).length > 0) {
        pipeline.push({ $sort: options.sorting });
    }
    const products = await Product.aggregate(pipeline);
    // console.log({ products });
    await Category.populate(products, { path: 'categories' });
    await Amenity.populate(products, { path: 'amenities' });
    await User.populate(products, { path: 'owner' });
    return products;
};

productSchema.plugin(autoincrement('id', null, (id) => `SPT${id.toString().padStart(6, '0')}`)); // PRD000001
productSchema.index({ name: 'text' });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;