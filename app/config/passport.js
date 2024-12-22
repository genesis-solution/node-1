const passport = require('passport');
const User = require('../model/User');
const AnonymousStrategy = require('passport-anonym-uuid');

module.exports = (app) => {
    app.use(passport.initialize());
    // app.use(passport.session());

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

    passport.use(require('./strategies/jwt'));
    passport.use('anonymous', new AnonymousStrategy());
};