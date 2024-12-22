const { Schema, model } = require('mongoose');

const introSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    description: {
        type: String
    },
},);

const Intro = model('Intro', introSchema);
module.exports = Intro;