const debug = require('debug')('app:routes:chargeRate');
const { upload } = require('../config/multer');
const { body, oneOf } = require('express-validator');
const havePermission = require('../middlewire/havePermission');
const { resources } = require('../model/Grant');
const ChargeRate = require('../model/ChargeRate');
const reportExpressValidator = require('../middlewire/reportExpressValidator');

const router = require('express').Router();
module.exports = router;


router.patch('/',
    havePermission(resources.chargeRate, ['createAny']),
    body('country').isString().notEmpty(),
    body('state').isString().notEmpty(),
    body('city').isString().notEmpty(),
    oneOf([
        body('taxRate').isNumeric().notEmpty(),
        body('serviceFee').isNumeric().notEmpty(),
    ]),
    reportExpressValidator,
    async (req, res, next) => {
        try {
            const { country, state, city, taxRate, serviceFee } = req.body;
            const updatedCharge = await ChargeRate
                .findOneAndUpdate(
                    { country, state, city },
                    { taxRate, serviceFee },
                    { upsert: true, new: true }
                );

            res.status(201).json(updatedCharge);

        } catch (error) {
            debug.extend(req.path)(error);
            next(error);
        }
    },
);

router.get('/',
    havePermission(resources.chargeRate, ['readAny'], true),
    async (req, res, next) => {
        try {
            const query = {};
            if (req.query.country) query.country = req.query.country;
            if (req.query.state) query.state = req.query.state;
            if (req.query.city) query.city = req.query.city;
            let chargeRates = await ChargeRate.find(query);
            chargeRates = JSON.parse(JSON.stringify(chargeRates));
            const canReadAny = res.locals.ac.readAny();
            chargeRates = canReadAny.filter(chargeRates);
            res.status(200).json(chargeRates);
        } catch (error) {
            debug.extend(req.path)(error);
            next(error);
        }
    },
);


router.get('/:distinct(cities|states)',
    havePermission(resources.chargeRate, ['readAny'], true),
    oneOf([
        body('country').isString().notEmpty(),
        body('state').isString().notEmpty(),
    ]),
    async (req, res, next) => {
        try {
            const query = {};
            if (req.query.country) query.country = req.query.country;
            if (req.query.state) query.state = req.query.state;
            const distinct = req.params.distinct === 'cities' ? 'city' : 'state';
            const chargeRate = await ChargeRate.find(query).distinct(distinct);
            res.status(200).json(chargeRate);
        } catch (error) {
            debug.extend(req.path)(error);
            next(error);
        }
    }
);

