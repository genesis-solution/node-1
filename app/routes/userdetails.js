const { body } = require('express-validator');
const havePermission = require('../middlewire/havePermission');
const User = require('../model/User');
const UserDetails = require('../model/UserDetails');
const { paginate } = require('../utils/paginations');
const reportExpressValidator = require('../middlewire/reportExpressValidator');

const router = require('express').Router();
const verbose = require('debug')('verbose:app:routes:userdetails');

module.exports = router;

router.get('/all',
    havePermission('userDetails', ['readAny']),
    async (req, res, next) => {
        try {
            await paginate({
                total: UserDetails.countDocuments(),
                page: req.query.page,
                start: req.query.start,
                size: req.query.size,
                handler: async (options, data) => {
                    const filter = {};
                    if (req.query.salutation) filter.salutation = req.query.salutation;
                    if (req.query.firstName) filter.firstName = req.query.firstName;
                    if (req.query.lastName) filter.lastName = req.query.lastName;
                    if (req.query.email) filter.email = req.query.email;
                    if (req.query.phone) filter.phone = req.query.phone;

                    const query = UserDetails.find(filter);
                    if (options.skip) query.skip(options.skip);
                    if (options.limit) query.limit(options.limit);
                    const userdetails = await query;
                    res.json({
                        data: userdetails,
                        ...data,
                        next: data.nextPage ? req.baseUrl + `?page=${data.nextPage}` : null,
                        prev: data.prevPage ? req.baseUrl + `?page=${data.prevPage}` : null
                    });
                }
            });
        } catch (error) {
            verbose(error);
            next(error);
        }
    }
);

router.get('/:id?',
    havePermission('userDetails', ['readOwn']),
    async (req, res, next) => {
        try {
            const canReadAny = res.locals.ac.readAny().granted;
            const id = req.params.id;
            const isOwner = id === req.user._id.toString();
            if (!canReadAny && !isOwner && id) return res.status(403).send();

            const user = canReadAny ? id ?? req.user._id : req.user._id;
            const userdetails = await UserDetails.findOne({ user: user });
            return res.send(userdetails);
        } catch (error) {
            verbose(error);
            next(error);
        }
    }
);

router.patch('/:id?',
    havePermission('userDetails', ['updateOwn']),
    body('salutation').optional().isString(),
    body('firstName').optional().isString(),
    body('lastName').optional().isString(),
    body('phone').optional().isString().isLength({ min: 10, max: 10 }),
    body('address').optional().isString(),
    body('state').optional().isString(),
    body('zip').optional().isNumeric(),
    body('city').optional().isString(),
    body('country').optional().isString(),
    body('document').optional().isString(),
    reportExpressValidator,
    async (req, res, next) => {
        try {
            const canUpdateAny = res.locals.ac.updateAny().granted;
            const id = req.params.id;
            const isOwner = id === req.user._id.toString();
            if (!canUpdateAny && !isOwner && id) return res.status(403).send();

            const user = canUpdateAny ? id ?? req.user._id : req.user._id;
            delete req.body.user;
            const userdetails = await UserDetails.findOneAndUpdate({ user: user }, req.body, { new: true, upsert: true, runValidators: true });
            await User.updateOne({ _id: user }, { name: `${userdetails.firstName} ${userdetails.lastName ?? ''}` });
            return res.send(userdetails);
        } catch (error) {
            verbose(error);
            next(error);
        }
    }
);