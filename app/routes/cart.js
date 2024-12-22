const { body } = require('express-validator');
const havePermission = require('../middlewire/havePermission');
const Cart = require('../model/Cart');
const Product = require('../model/Product');
const reportExpressValidator = require('../middlewire/reportExpressValidator');
const router = require('express').Router();
const debug = require('debug')('app:routes:cart');
module.exports = router;

router.get('/',
    havePermission('cart', ['readOwn']),
    async (req, res, next) => {
        try {
            const canReadAny = res.locals.ac.readAny();
            const readOwn = res.locals.ac.readOwn();

            const query = {};
            if (!canReadAny.granted) query.user = req.user._id;
            let carts = await Cart.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'product',
                        foreignField: '_id',
                        as: 'product',
                        pipeline: [
                            {
                                $lookup: {
                                    from: 'categories',
                                    localField: 'categories',
                                    foreignField: '_id',
                                    as: 'categories'
                                },
                            },
                            {
                                $lookup: {
                                    from: 'amenities',
                                    localField: 'amenities',
                                    foreignField: '_id',
                                    as: 'amenities'
                                },
                            },
                            {
                                $project: {
                                    //NOTE: check seed.js for the fields
                                    name: 1,
                                    price: 1,
                                    description: 1,
                                    category: 1,
                                    images: 1,
                                    sort: 1,
                                    categories: 1,
                                    amenities: 1,
                                    owner: 1,
                                    availability: 1,
                                    _id: 1,
                                    id: 1,
                                    location: 1,
                                    orders: 1
                                    
                                }
                            }

                        ]
                    }
                },
                {
                    $unwind: '$product'
                },
                {
                    $group: {
                        _id: '$user',
                        products: {
                            $push: {
                                product: '$product',
                                quantity: '$quantity'
                            }
                        }
                    }
                },

            ]).then(carts => JSON.parse(JSON.stringify(carts)));

            carts = readOwn.filter(carts?.[0] ?? {});
            res.json(carts);

        } catch (error) {
            debug.extend(req.path)(error);
            next(error);
        }
    }
);

router.post('/',
    havePermission('cart', ['createOwn']),
    body('product').isMongoId(),
    reportExpressValidator,
    async (req, res, next) => {
        try {
            const { product, quantity } = req.body;

            const cart = await Cart.findOneAndUpdate(
                { user: req.user._id, product },
                {
                    product,
                    quantity
                },
                { upsert: true, new: true }
            );
            console.log(cart);
            res.status(201).json(cart);
        } catch (error) {
            next(error);
        }
    }
);

router.delete('/:product',
    havePermission('cart', ['deleteOwn']),
    async (req, res, next) => {
        try {
            const query = {};
            const canDeleteAny = res.locals.ac.deleteAny();
            if (!canDeleteAny.granted) query.user = req.user._id;
            query.product = req.params.product;
            const cart = await Cart.findOneAndDelete(query);
            if (!cart) return res.status(404).send();
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
);

