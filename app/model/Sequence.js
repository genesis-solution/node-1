const mongoose = require('mongoose');
const debug = require('debug')('app:model:sequence');

const Schema = mongoose.Schema;

const sequenceSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    seq: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

sequenceSchema.statics.next = async function (name) {
    const sequence = await this.findOneAndUpdate(
        { name },
        { $inc: { seq: 1 } },
        { new: true, upsert: true },
    );
    return sequence.seq;
};
/**
 * Plugin for mongoose schema to autoincrement a field
 * @param {String} field default is 'id'
 * @param {String} model name of the model to use for autoincrement (default is the model name of the schema)
 * @param {(id: number) => string} prefix prefix to add to the autoincremented value
 * @returns {(schema: mongoose.Schema) => void} 
 * @example ```js
 * const userSchema = new Schema({
 *  id: Number,
 * });
 * userSchema.plugin(autoincrement('id'));
 * const User = mongoose.model('User', userSchema);
 * ```
 */
const autoincrement = (field = 'id', model, prefix) => (schema) => {
    if (!schema.path(field)) {
        throw new Error(`Field ${field} does not exist in the schema`);
    }
    schema.pre('save', async function (next) {
        const doc = this;
        if (!doc[field]) {
            const id = await Sequence.next(model ?? doc.constructor.modelName);
            doc[field] = prefix ? `${prefix(id)}` : id;
        }
        next();
    });
    schema.post('findOneAndUpdate', async function (doc, next) {
        // const doc = this;
        if (!doc) return; // is new not provided
        // console.log(doc);
        if (doc[field] !== undefined) {
            return next();
        }
        const id = await Sequence.next(model ?? doc.model.modelName);
        doc[field] = prefix ? `${prefix(id)}` : id;


        await doc.save();
        next();
    });
};

const Sequence = mongoose.model('Sequence', sequenceSchema);
module.exports = {
    Sequence,
    autoincrement,
};