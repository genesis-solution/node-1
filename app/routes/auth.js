const router = require('express').Router();
const User = require('../model/User');
const debug = require('debug')('app:routes:auth');
const passport = require('passport');
const mongoose = require('mongoose');
const errorCodes = require('../errors/codes');

const emailService = require('../service/mail');
const jwt = require('../utils/jwt');
const havePermission = require('../middlewire/havePermission');
const { Grant } = require('../model/Grant');
const { body, param } = require('express-validator');
const reportExpressValidator = require('../middlewire/reportExpressValidator');
const UserDetails = require('../model/UserDetails');
const paginations = require('../utils/paginations');
const { default: rateLimit } = require('express-rate-limit');
const multer = require('../config/multer');
const JsonWebTokenError = require('jsonwebtoken').JsonWebTokenError;

function emptyMiddleware(req, res, next) {
    next();
}

const limiter = process.env.NODE_ENV !== 'production'
    ? emptyMiddleware
    : rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        limit: 20, // Limit each IP to 20 requests per `window` (here, per 5 minutes).
        standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
        // store: ... , // Redis, Memcached, etc. See below.
    });

router.use(limiter);

router.post('/register',
    havePermission('user', ['createAny'], true),
    async (req, res, next) => {
        try {
            const createAny = res.locals.ac.createAny();
            req.body.name = req.body.name || [req.body.firstName, req.body.lastName].filter(Boolean).join(' ');
            const request = req.body;
            const role = request.role;
            if (role) request.role = { [role]: role };
            const data = createAny.filter(request);
            // debug(data);
            // debug(request);
            if (!data.role) return res.status(403).json(errorCodes.FORBIDDEN);
            const userExists = await User.findOne({ email: data.email });
            if (userExists) {
                return res.status(400).json({ message: 'Email already exists' });
            }
            data.role = role;
            if (role != 'user' && data.twoFactorAuthEnabled === undefined) {
                data.twoFactorAuthEnabled = true;
            }


            const user = await User.create(data);
            await UserDetails.collection.insertOne({
                user: user._id,
                firstName: data.firstName,
                lastName: data.lastName,
            });
            // debug(user);
            res.status(201).json({
                _id: user._id,
                name: user.name,
                verified: user.verified,
            });
        } catch (err) {
            debug.extend(req.path)(err);
            next(err);
        }
    }
);

router.post('/login',
    body('email').isEmail(),
    body('password').isString(),
    reportExpressValidator,
    async (req, res, next) => {
        try {
            const email = req.body.email;
            const password = req.body.password;
            if (!email || !password) {
                return res.status(400).send();
            }

            const user = await User.authenticate(email, password);
            if (!user) return res.status(401).json(errorCodes.INVALID_EMAIL_PASSWORD);

            if (user.disabled) return res.status(404).json(errorCodes.ACCOUNT_DISABLED);
            if (!user.verified) return res.status(404).json(errorCodes.ACCOUNT_NOT_VERIFIED);
            if (user.twoFactorAuthEnabled) return res.status(423).json(errorCodes['2FA_ENABLED']);

            const token = user.generateToken();
            res.cookie('token', token, { httpOnly: true, sameSite: 'strict' });
            user.password = undefined;
            res.json({ token, user });
        } catch (error) {
            debug.extend(req.path)(error);
            next(error);
        }
    },
);

router.get('/me',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            req.user.password = undefined;
            // debug(req.user);
            const token = req.user.generateToken();
            res.cookie('token', token, { httpOnly: true, sameSite: 'strict' });

            res.json({
                token,
                user: req.user,
            });
        } catch (error) {
            debug.extend(req.path)(error);
            next(error);
        }
    }
);

router.post('/request-2fa-token', async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        if (!email || !password) return res.status(400).send();


        const user = await User.authenticate(email, password);
        if (!user) return res.status(401).send(errorCodes.INVALID_EMAIL_PASSWORD);

        const payload = { _id: user._id, ip: req.ip, for: '2fa' };
        const token = jwt.generateJwtToken(payload, { expiresIn: '3m' });
        //TODO: send email with token
        emailService.sendEmail2FA(email, user.name, token);
        res.status(200).send();
    } catch (error) {
        debug.extend(req.path)(error);
        next(error);
    }
});

router.post('/verify-2fa-token', async (req, res, next) => {
    try {
        const token = req.body.token;
        if (!token) return res.status(400).send();

        const decoded = jwt.verify(token);
        if (decoded.for !== '2fa') return res.status(400).send();

        const user = await User.findById(decoded._id);
        if (!user) return res.status(404).send();
        if (user.disabled) return res.status(404).json(errorCodes.ACCOUNT_DISABLED);

        const newAuthToken = user.generateToken();
        user.password = undefined;
        res.cookie('token', newAuthToken, { httpOnly: true, sameSite: 'strict' });
        res.json({ token: newAuthToken, user });
    } catch (error) {
        if (error instanceof JsonWebTokenError) return res.status(400).send();
        debug.extend(req.path)(error);
        next(error);
    }
});

router.post('/request-verification', async (req, res, next) => {
    try {
        const email = req.body.email;
        if (!email) return res.status(400).send();

        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).send();
        const payload = { _id: user._id, ip: req.ip, for: 'email-verification' };
        const token = jwt.generateJwtToken(payload, { expiresIn: '3m' });
        //TODO: send email with token
        emailService.sendEmailVerification(email, token);
        res.status(200).send();
    } catch (error) {
        debug.extend(req.path)(error);
        next(error);
    }
});

router.post('/confirm-verification', async (req, res, next) => {
    const token = req.body.token;
    if (!token) return res.status(400).send();

    try {
        const decoded = jwt.verify(token);
        if (decoded.for !== 'email-verification') return res.status(400).send();

        const user = await User.findById(decoded._id);
        if (!user) return res.status(404).send();
        //TODO: check decoded.ip with current req.ip

        await User.updateOne({ _id: user._id }, { verified: true });
        res.status(200).send();

    } catch (error) {
        if (error instanceof JsonWebTokenError) return res.status(400).send();
        debug.extend(req.path)(error);
        next(error);
    }

});

router.post('/request-password-reset', async (req, res, next) => {
    const email = req.body.email;
    if (!email) return res.status(400).send();

    try {
        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).send();

        const token = jwt.generateJwtToken({ _id: user._id, ip: req.ip, for: 'password-reset' }, { expiresIn: '3m' });
        //TODO: send email with token
        emailService.sendEmailForgotPassword(email, token);

        res.status(200).send();
    } catch (error) {
        debug.extend(req.path)(error);
        next(error);
    }
});

router.post('/confirm-password-reset', async (req, res, next) => {
    try {
        const token = req.body.token;
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        if (!token || !password || !confirmPassword) return res.status(400).send();

        if (password !== confirmPassword) return res.status(400).send();

        const decoded = jwt.verify(token);
        if (decoded.for !== 'password-reset') return res.status(400).send();

        const user = await User.findById(decoded._id);
        if (!user) return res.status(401).send();
        //TODO: check decoded.ip with user.ip


        user.password = password;
        await user.save();

        res.status(200).send();
    } catch (error) {
        if (error instanceof JsonWebTokenError) return res.status(400).send();
        debug.extend(req.path)(error);
        next(error);
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie('token');
    res.status(200).send();
});

router.delete('/user/:id?',
    havePermission('user', ['deleteOwn'],),
    param('id').optional().isMongoId(),
    reportExpressValidator,
    async (req, res, next) => {
        try {
            const id = req.params.id;
            const deleteAny = res.locals.ac.deleteAny();

            const query = {};

            if (!deleteAny.granted) query._id = req.user._id;
            else query._id = id || req.user._id;

            //TODO: check dependencies before delete

            const user = await User.findOne(query);
            if (!user) return res.status(404).send();
            const roles = await Grant.distinct('role');

            const data = {
                role: Object.fromEntries(roles.map(role => [role, role])),
            };
            const filter = deleteAny.filter(data);
            // if filter role is empty, user can't delete
            if (Object.keys(filter.role).length === 0) return res.status(403).send(errorCodes.FORBIDDEN);

            query.role = { $in: Object.keys(filter.role) };

            await User.deleteOne(query);

            res.status(200).send(user);
        } catch (error) {
            debug.extend(req.path)(error);
            next(error);
        }
    }
);


router.patch('/user/:id?',
    havePermission('user', ['updateOwn'],),
    multer.upload('user').single('profilePic'),
    param('id').optional().isMongoId(),
    reportExpressValidator,
    async (req, res, next) => {
        try {
            let id = req.params.id;
            const updateAny = res.locals.ac.updateAny();

            if (!updateAny.granted) id = req.user._id;
            else id = id || req.user._id;

            const updateOwn = res.locals.ac.updateOwn();
            if (!updateOwn.granted) return res.status(403).send(errorCodes.FORBIDDEN);

            const request = req.body;
            request.name = request.name || [request.firstName, request.lastName].filter(Boolean).join(' ') || undefined;
            request.profilePic = req.file?.filename;
            const role = request.role;
            if (role) request.role = { [role]: role };


            const data = updateOwn.filter(request);
            if (!data.role && role) return res.status(403).send(errorCodes.FORBIDDEN);
            data.role = role;

            if (Object.keys(data).length === 0) return res.status(400).send(errorCodes.BAD_REQUEST);

            // if data.password is not empty, check req.body.currentPassword if it matches user.password
            if (data.password) {
                const currentPassword = req.body.currentPassword;
                if (!currentPassword) return res.status(400).send({ ...errorCodes.BAD_REQUEST, errors: [{ path: 'currentPassword', msg: 'currentPassword is required' }] });
                const user = await User.findById(id);
                if (!user) return res.status(404).send();
                if (!await User.authenticate(user.email, req.body.currentPassword)) return res.status(400).send({ ...errorCodes.BAD_REQUEST, errors: [{ path: 'currentPassword', msg: 'currentPassword is incorrect' }] });
            }

            const user = await User.findByIdAndUpdate(id, data, { new: true });
            if (!user) return res.status(404).send();
            if (data.firstName) {
                await UserDetails.updateOne({ user: user._id }, { firstName: data.firstName, lastName: data.lastName });
            }
            res.status(200).send();
        } catch (error) {
            debug.extend(req.path)(error);
            next(error);
        }
    }
);

router.use('/user/image', multer.static('user'));

router.get('/user/:id?',
    havePermission('user', ['readOwn'],),
    async (req, res, next) => {
        try {
            let id = req.params.id;
            if (id && !mongoose.Types.ObjectId.isValid(id)) return res.status(400).send();
            const readAny = res.locals.ac.readAny();

            if (!readAny.granted) id = req.user._id;
            else id = id || req.user._id;

            const user = await User.findById(id);
            if (!user) return res.status(404).send();

            const readOwn = res.locals.ac.readOwn();
            const filteredUser = readOwn.filter({ ...user.toObject(), _id: user._id.toString() });
            res.json(filteredUser);
        } catch (error) {
            debug.extend(req.path)(error);
            next(error);
        }
    }
);

router.get('/users',
    havePermission('user', ['readAny'],),
    async (req, res, next) => {
        try {
            const readAny = res.locals.ac.readAny();
            await paginations.paginateWithMaterialReactTable({
                req,
                filter: (query) => readAny.filter(query),
                total: (query) => User.countDocuments(query),
                handler: async ({ skip, limit }, others, { query, sorting }) => {
                    var users = await User.find(query)
                        .sort(sorting)
                        .skip(skip).limit(limit);
                    users = readAny.filter(JSON.parse(JSON.stringify(users)));
                    return res.json({ users, ...others });
                }
            });

        } catch (error) {
            debug.extend(req.path)(error);
            next(error);
        }
    }
);

module.exports = router;
