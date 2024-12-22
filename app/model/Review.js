const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const autoincrement = require('./Sequence').autoincrement;

const reviewSchema = new Schema({
    target: {
        type: Schema.Types.ObjectId,
        refPath: 'onModel',
        required: true
    },
    reply :{
        type : String,
    },
    owner :{
        type : String,
    },
    onModel: {
        type: String,
        required: true,
        enum: ['Product', 'User'],
        default: 'Product'
    },
    tags:{
        type : Array,
        default : []
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: String,
    },
    rating: {
        type: Number,
        required: true
    },
    id: {
        type: Number,
    },
    approved: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

reviewSchema.plugin(autoincrement('id'));
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;