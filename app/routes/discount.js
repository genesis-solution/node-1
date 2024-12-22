const verbose = require('debug')('verbose:app:routes:discount');
const debug = require('debug')('app:routes:discount');
const Discount = require('../model/Discount');
const mongoose = require('mongoose');
const Product = require('../model/Product');
const havePermission = require('../middlewire/havePermission');
const { body, param } = require('express-validator');
const reportExpressValidator = require('../middlewire/reportExpressValidator');

const router = require('express').Router();
module.exports = router;

router.get('/',
    havePermission('discount', ['readAny']),
    async (req, res, next) => {
        try {
            const discounts = await Discount.find({})
                .populate('products', 'name')
                .populate('categories', 'name');
            res.json(discounts);
        } catch (error) {
            debug(error);
            next(error);
        }
    }
);

const DuplicateKeyError = 11000;

router.post('/',
    havePermission('discount', ['createAny']),
    async (req, res, next) => {
        try {
            const discount = new Discount(req.body);
            await discount.save();
            res.status(201).json(discount);
        } catch (error) {
            debug(error);
            next(error);
        }
    }
);

router.post('/validation',
    havePermission('discount', ['readAny']),
    body('code').isString().isLength({ min: 1 }),
    body('product').optional().isMongoId(),
    body('amount').optional().isNumeric(),
    reportExpressValidator,
    async (req, res, next) => {
        try {
            const code = req.body.code;
            const query = { code };
            const discount = await Discount.findOne(query);
            if (!discount) {
                verbose('Discount not found', query);
                return res.status(404).json({ valid: false, saves: 0 });
            }
            verbose('Discount found', discount);
            const valid = discount.isValid();
            if (valid && req.body.product) {
                const product = await Product.findById(req.body.product);
                if (!product) {
                    verbose('Product not found', req.body.product);
                    return res.status(404).json({ valid: false, saves: 0 });
                }

                if (!discount.isApplicable(product)) {
                    verbose('Discount not applicable', { discount, product });
                    return res.status(404).json({ valid: false, saves: 0 });
                }

            }
            if(!valid){
                return res.status(404).json({ valid: false, saves: 0 });
            }
            const saves = discount.calculate(req.body.amount ?? 0);
            res.json({ valid, saves });
        } catch (error) {
            debug(error);
            next(error);
        }
    }
);

router.delete('/:id',
    havePermission('discount', ['deleteAny']),
    param('id').isMongoId(),
    reportExpressValidator,
    async (req, res, next) => {
        try {
            const id = req.params.id;
            const discount = await Discount.findByIdAndDelete(id);
            if (!discount) {
                return res.status(404).end();
            }

            res.status(200).end();
        } catch (error) {
            debug(error);
            next(error);
        }
    }
);