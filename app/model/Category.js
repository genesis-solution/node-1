const mongoose = require('mongoose');
const Sequence = require('./Sequence').Sequence;
const Schema = mongoose.Schema;
const debug = require('debug')('app:model:category');

const CategorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    banner: { type: String, },
    id: { type: Number, unique: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
});

CategorySchema.pre('save', async function (next) {
    if (this.parent) {
        await Category.updateOne({ _id: this.parent }, { $addToSet: { categories: this._id } });
    }
    next();
});

CategorySchema.pre('deleteOne', async function (next) {
    const category = await this.model.findOne(this.getFilter());
    // debug('Deleting category', category);
    if (category.parent) {
        await Category.updateOne({ _id: category.parent }, { $pull: { categories: category._id } });
    }
    next();
});


CategorySchema.statics.findTree = async function (id) {
    const category = await this.findOne({ _id: id }).populate('categories');
    if (category.categories.length > 0) {
        category.categories = await Promise.all(category.categories.map(async (subCategory) => {
            return await this.findTree(subCategory._id);
        }
        ));
    }
    return category;
};

/**
 * Group categories by parent category in a tree structure
 * [A -> children: [B -> children: [C -> children: [D], E], F]]
 * @returns 
 */
CategorySchema.statics.findGrouped = async function () {
    const categories = await this.find({ parent: null }).populate('categories');
    return await Promise.all(categories.map(async (category) => {
        category.categories = await Promise.all(category.categories.map(async (subCategory) => {
            return await this.findTree(subCategory._id);
        }
        ));
        return category;
    }
    ));
};
CategorySchema.index({ name: 1 }, { unique: true });

CategorySchema.plugin(require('./Sequence').autoincrement('id'));

const Category = mongoose.model('Category', CategorySchema);
module.exports = Category;