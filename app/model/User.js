const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { generateJwtToken } = require('../utils/jwt');
const { autoincrement } = require('./Sequence');
const debug = require('debug')('app:model:user');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'user',
    },
    document : {
        type: String,
    },
    profilePic: {
        type: String,
    },
    twoFactorAuthEnabled: {
        type: Boolean,
        default: false,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    chatID: {
        type: String,
    },
    id: String,
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.pre('findOneAndUpdate', async function (next) {
    if (this._update.password) {
        this._update.password = await bcrypt.hash(this._update.password, 10);
    }
    next();
});

userSchema.statics.authenticate = async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) {
        return null;
    }
    const match = await bcrypt.compare(password, user.password).catch(e => false);
    if (match === false) {
        return null;
    }
    return user;
};


userSchema.methods.generateToken = function (options = {}) {
    return generateJwtToken({ id: this._id, role: this.role }, options);
};
userSchema.plugin(autoincrement('id', null, (id) => `U${id.toString().padStart(6, '0')}`)); // U000001
userSchema.index({ email: 1 }, { unique: true });
const User = mongoose.model('User', userSchema);
module.exports = User;