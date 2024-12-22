const { Schema } = require("mongoose");

const entitySchema = new Schema({
    type: {
        type: String,
        enum: [
            "User",
        ],
        required: true,
    },
    entity: {
        type: Schema.Types.ObjectId,
        ref: function () {
            return this.type;
        },
        required: true,
    },
});
module.exports = entitySchema;