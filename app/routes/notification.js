const havePermission = require('../middlewire/havePermission');
const Notification = require('../model/Notification');
const { paginate } = require('../utils/paginations');
const debug = require('debug')('app:routes:notification');

const router = require('express').Router();
module.exports = router;

router.get('/',
    havePermission('notification', ['readOwn']),
    async (req, res, next) => {
        try {
            let user = req.query.user || req.user._id;
            const canReadAny = res.locals.ac.readAny().granted;

            // if user is not admin, set user to the logged in user
            if (!canReadAny) user = req.user._id;

            await paginate({
                total: Notification.countDocuments({ user }),
                page: req.query.page,
                start: req.query.start,
                size: req.query.size,
                handler: async ({ limit, skip }, others) => {
                    let notifications = await Notification
                        .find({ user })
                        .sort({ createdAt: -1 }) // from newest to oldest
                        .limit(limit)
                        .skip(skip);
                    notifications = res.locals.ac.readOwn().filter(JSON.parse(JSON.stringify(notifications)));
                    res.json({ notifications, ...others });
                }

            });
        } catch (error) {
            debug.extend(req.path)(error);
            next(error);
        }
    }
);

router.patch('/:id',
    havePermission('notification', ['updateOwn']),
    async (req, res, next) => {
        try {
            const canUpdateAny = res.locals.ac.updateAny().granted;
            const query = { _id: req.params.id };
            if (!canUpdateAny) query.user = req.user._id;
            const notification = await Notification.findOne(query);
            if (!notification) {
                return res.status(404).send();
            }
            const update = res.locals.ac.updateOwn().filter(req.body);
            // debug({ update });
            const updatedNotification = await Notification.findByIdAndUpdate(req.params.id, update, { new: true });
            res.json(updatedNotification);

        } catch (error) {
            debug.extend(req.path)(error);
            next(error);
        }
    }
);

router.post('/mark-all-read',
    havePermission('notification', ['updateOwn']),
    async (req, res, next) => {
        try {
            const query = { user: req.user._id };
            const update = { read: true };
            const updatedNotification = await Notification.updateMany(query, update);
            res.json(updatedNotification);
        } catch (error) {
            debug.extend(req.path)(error);
            next(error);
        }
    }
);
