const passport = require('passport');
/**
 * Middleware to check if the user has the role to access the route
 * @param  {string[]} roles 
 * @returns {import("express").RequestHandler}
 * @deprecated Use havePermission instead
 */
module.exports = (...roles) => (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).send({ message: 'Unauthorized' });
        }
        if (!roles.includes(user.role)) {
            return res.status(403).send({ message: 'Forbidden' });
        }
        req.user = user;
        next();
    })(req, res, next);
};