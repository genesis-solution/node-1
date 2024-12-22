//@ts-check
const passport = require('passport');
const { AccessControl } = require('accesscontrol');
const { Grant, typeResource, resources } = require('../model/Grant');
const verbose = require('debug')('verbose:app:middlware:havePermission');
const express = require('express');
const User = require('../model/User');
/** 
 * 
 * @param {typeResource} resource
 * @param {Array<'createAny' | 'createOwn' | 'readAny' | 'readOwn' | 'updateAny' | 'updateOwn' | 'deleteAny' | 'deleteOwn'>} permissions
 * @param {boolean} allowAnonymous
 * @returns {express.RequestHandler}
 */
module.exports = (resource, permissions = [], allowAnonymous = false) => {
    if (resources[resource] === undefined) {
        throw TypeError(`The resource ${resource} is not defined`);
    }
    const strategies = ['jwt'];
    if (allowAnonymous) {
        strategies.push('anonymous');
    }
    return (
        /**@type {express.Request} */ req,
        /**@type {express.Response} */ res,
        /**@type {express.NextFunction} */ next
    ) => {
        return passport.authenticate(strategies, { session: false }, async (err, user, info) => {
            if (err) {
                verbose(err);
                return next(err);
            }
            if (!user && !allowAnonymous) {
                return res.status(401).send();
            }

            try {
                user = user || {};
                user.role = user.role || 'anonymous';
                user._id = user._id || user.uuid;

                // console.log(user);
                const grants = await Grant
                    .find({ resource, $or: [{ role: user._id.toString() }, { role: user.role }] });

                if (!grants?.length) {
                    return res.status(403).send();
                }

                const ac = new AccessControl(grants.map(grant => grant.toObject()));
                const p = ac.can(ac.getRoles()).resource(resource);
                const granted = permissions.some(permission => p[permission].bind(p)().granted);
                if (!granted) {
                    return res.status(403).send();
                }
                req.user = user;
                res.locals.ac = p;
                next();
            } catch (error) {
                if (AccessControl.isAccessControlError(error)) {
                    return res.status(403).send();
                }
                verbose(error);
                next(error);
            }
        })(req, res, next);


    };
};