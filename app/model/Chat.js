const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    message: String,
    file: String,
    type: {
        type: String,
        enum: ['text', 'image', 'file'],
        default: 'text'
    }

}, { timestamps: true });

const ChatSchema = new Schema({
    users: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    broadcast: {
        type: [String],
    },
    type: {
        type: String,
        enum: ['private', 'system', 'broadcast'],
        default: 'private'
    },
    messages: [
        MessageSchema
    ]
});

const Chat = mongoose.model('Chat', ChatSchema);
module.exports = Chat;