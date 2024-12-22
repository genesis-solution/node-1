const { Schema, model } = require('mongoose');

const NotificationSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        required: true
    },
    reference: {
        type: Schema.Types.ObjectId,
        ref: function () {
            return this.type;
        }
    }
}, {
    timestamps: true
});

const Notification = model('Notification', NotificationSchema);
module.exports = Notification;