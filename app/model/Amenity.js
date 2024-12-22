const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const debug = require('debug')('app:model:Amenity');

const AmenitySchema = new Schema({
    name: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    id: { type: Number, unique: true },
});

AmenitySchema.index({ name: 1 }, { unique: true });
AmenitySchema.plugin(require('./Sequence').autoincrement('id'));

const Amenity = mongoose.model('Amenity', AmenitySchema);
module.exports = Amenity;