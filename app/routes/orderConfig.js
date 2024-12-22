const router = require('express').Router();
const v = require('express-validator');
const havePermission = require('../middlewire/havePermission');
const OrderConfig = require('../model/OrderConfig');
const reportExpressValidator = require('../middlewire/reportExpressValidator');
const debug = require('debug')('app:routes:orderConfig');

module.exports = router;


router.get('/',
    havePermission('order/config', ['readOwn']),
    v.query('user').optional().isMongoId(),
    reportExpressValidator,
    async (req, res, next) => {
        try {
            const user = res.locals.ac.readAny().granted ? req.query.user : req.user._id;
            const query = {};
            if (user) query.user = user;
            const config = await OrderConfig.findOne(query);
            return res.json({ config })
        } catch (error) {
            debug(error);
            next(error);
        }
    }
)


router.patch('/:id?',
    havePermission('order/config', ['updateOwn']),
    v.body('user').optional().isMongoId(),
    reportExpressValidator,
    async (req, res, next) => {
        try {
            const canUpdateAny = res.locals.ac.updateAny();
            const canUpdateOwn = res.locals.ac.updateOwn();

            const data = canUpdateOwn.filter(req.body);

            if (!canUpdateAny.granted) data.user = req.user._id;
            const config = await OrderConfig.findOneAndUpdate({ user: data.user }, data, { upsert: true, new: true })
            res.json({ config })
        } catch (error) {
            debug(error)
            next(error);
        }
    }
)