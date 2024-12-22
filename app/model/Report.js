// Report model
const mongoose = require("mongoose");
const { autoincrement } = require("./Sequence");
const entitySchema = require("./schema/Entity");
const Schema = mongoose.Schema;




const reportSchema = new Schema({
    reason: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    entity: {
        type: entitySchema,
        required: true,
        _id: false,
    },
    reportedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
        required: true,
    },
    rejectedReason: {
        type: String,
        default: null,
    },
    screenshots: {
        type: [String],
        default: [],
    },
    id: Number,
}, { timestamps: true });

reportSchema.plugin(autoincrement());

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
