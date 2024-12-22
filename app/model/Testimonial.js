const { Schema, model } = require('mongoose');
const { ObjectId } = Schema.Types;

const TestimonialSchema = new Schema({
    user: {
        name: {
            type: String,
            required: true,
        },
        photo: {
            type: String,
            required: true,
        },
    },
    content: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
}, { timestamps: true, });

const Testimonial = model('Testimonial', TestimonialSchema);
module.exports = Testimonial;