const havePermission = require('../middlewire/havePermission');
const reportExpressValidator = require('../middlewire/reportExpressValidator');
const BankAccount = require('../model/BankAccount');

const router = require('express').Router();
const debug = require('debug')('app:routes:BankAccount');
const paginations = require('../utils/paginations');

const v = require('express-validator');


router.patch('/:user?',
    havePermission('bankAccount', ['updateOwn']),
    async (req, res, next) => {
        try {

            let user;
            const updateAny = res.locals.ac.updateAny();
            const updateOwn = res.locals.ac.updateOwn();

            if (updateAny.granted) user = req.params.user || req.user._id;
            else user = req.user._id;
            const data = updateOwn.filter(req.body);

            const billing = await BankAccount.findOneAndUpdate({ user }, data, { new: true, upsert: true });
            return res.json(billing);
        } catch (error) {
            debug.extend(req.path)(error);
            next(error);
        }
    }
);

router.get('/all',
    havePermission('bankAccount', ['readAny']),
    async (req, res, next) => {
        try {
            console.log(req.query)
            const readAny = res.locals.ac.readAny();
            await paginations.paginateWithMaterialReactTable({
                req,
                total: (query) => BankAccount.countDocuments(query),
                filter: (query) => readAny.filter(query),
                handler: async ({ skip, limit }, others, { query, sorting }) => {
                    var data = await BankAccount.find(query)
                        .populate('user')
                        .sort(sorting)
                        .skip(skip).limit(limit);
                    data = readAny.filter(JSON.parse(JSON.stringify(data)));
                    return res.json({ data, ...others });
                }
            });
        } catch (error) {
            debug.extend(req.path)(error);
            next(error);
        }
    }
);

router.get('/:user?',
    havePermission('bankAccount', ['readOwn']),
    v.param('user').isMongoId().optional(),
    reportExpressValidator,
    async (req, res, next) => {
        try {
            let user;
            const readAny = res.locals.ac.readAny();
            const readOwn = res.locals.ac.readOwn();

            if (readAny.granted) user = req.params.user || req.user._id;
            else user = req.user._id;

            const billing = await BankAccount.findOne({ user }).populate('user');
            let data = JSON.parse(JSON.stringify(billing ?? {}));
            data = readOwn.filter(data);
            return res.json(data);
        } catch (error) {
            debug.extend(req.path)(error);
            next(error);
        }
    }
);


module.exports = router;
