const jwt = require('passport-jwt');
const User = require('../../model/User');
const { log } = require("debug");
const debug = require('debug')('app:config:strategies:jwt');

const jwtFromExtractor = (req) => {
    if (req && req.cookies?.token) {
        return req.cookies['token'];
    }
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return null;
    }
    return token;
};

module.exports = new jwt.Strategy({
    secretOrKey: process.env.JWT_SECRET,
    jwtFromRequest: jwtFromExtractor
}, async (jwt_payload, done) => {
    User.findById(jwt_payload.id).then(user => {
        if (!user) return done(null, false);
        if (user.disabled || !user.verified) return done(null, false);
        return done(null, user);
    }).catch(err => {
        return done(err, false);
    }
    );
});

