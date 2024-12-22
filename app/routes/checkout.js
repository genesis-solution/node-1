const Order = require('../model/Order');
const Product = require('../model/Product');
const Discount = require('../model/Discount');

const express = require('express');
const router = express.Router();
const haveRole = require('../middlewire/haveRole');
const controller = require('../controller/checkout');
const havePermission = require('../middlewire/havePermission');
const User = require('../model/User');
const verbose = require('debug')('verbose:app:routes:checkout');
const debug = require('debug')('app:routes:checkout');
const mongoose = require('mongoose');
const { resources } = require('../model/Grant');
const { body } = require('express-validator');
const reportExpressValidator = require('../middlewire/reportExpressValidator');
const codes = require('../errors/codes');
const ChargeRate = require('../model/ChargeRate');
const groupBy = require('lodash.groupby');
const ObjectId = mongoose.Types.ObjectId;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = router;

router.post('/',
    havePermission(resources.checkout, ['createOwn']),
    body('products.*.product')
        .isMongoId().withMessage('Product is invalid'),
    body('products.*.guests')
        .isInt({ min: 1 }).withMessage('Guests is required'),
    body('discount')
        .optional().isString().trim().notEmpty()
        .withMessage('Discount is invalid'),
    body('rent.start')
        .isString()
        .trim()
        .notEmpty()
        .custom(value => new Date(value).getTime())
        .withMessage('Rent start time is required'),
    body('rent.end')
        .isString()
        .trim()
        .notEmpty()
        .custom(value => new Date(value).getTime())
        .withMessage('Rent end time is required'),
    body('user')
        .optional()
        .isMongoId()
        .withMessage('User is invalid'),
    reportExpressValidator,
    async (req, res) => {

        const { products, discount, rent } = req.body;
        try {
            const start = new Date(rent.start);
            const end = new Date(rent.end);

            // calculate the rent duration in hours
            const duration = Math.ceil((end.getTime() - start.getTime()) / 3.6e6);

            if (duration < 1) {
                return res.status(400).json(codes.CHECKOUT_INVALID_RENT_DURATION);
            }

            const createAny = res.locals.ac.createAny().granted;
            const user = createAny ? req.body.user : req.user._id;
            if (!user) {
                return res.status(400).json(codes.CHECKOUT_USER_NOT_FOUND);
            }

            const userExists = await User.exists({ _id: user });
            if (!userExists) {
                return res.status(400).json(codes.CHECKOUT_USER_NOT_FOUND);
            }
            const _productsID = products.map(p => new ObjectId(p.product + ''));
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const day = dayNames[start.getDay()];

            const COOLDOWN = 4 * 60 * 60 * 1000; // 4 hours
            const startTime = new Date(start.getTime() - COOLDOWN);

            const _rent = { start: startTime, end: end };

            const foundProducts = await Product.aggregate([
                {
                    $match: {
                        _id: { $in: _productsID },
                        [`availability.${day}.holiday`]: false,
                    }
                },
                {
                    $lookup: {
                        from: 'orders',
                        localField: '_id',
                        foreignField: 'products.product',
                        as: 'orders',
                        pipeline: [
                            {
                                $match: {
                                    status: { $eq: 'confirmed' },
                                    // check if the order is active
                                    // rent.start time is between the rent start and end
                                    // rent.end time is between the rent start and end
                                    // rent time is between the start and end time

                                    $or: [
                                        { $and: [{ 'rent.start': { $gte: startTime } }, { 'rent.start': { $lte: end } }] }, // start time is between the rent start and end
                                        { $and: [{ 'rent.end': { $gte: startTime } }, { 'rent.end': { $lte: end } }] }, // end time is between the rent start and end
                                        { $and: [{ 'rent.start': { $lte: startTime } }, { 'rent.end': { $gte: end } }] }, // rent time is between the start and end time
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'orderconfigs',
                        localField: 'owner',
                        foreignField: 'user',
                        as: 'orderconfigs',
                        pipeline: [
                            {
                                $match: {
                                    // check if the order is active
                                    // blocked.start time is between the rent start and end
                                    // blocked.end time is between the rent start and end
                                    // blocked time is between the start and end time

                                    $or: [
                                        { "blocked.start": { $lte: _rent.end, $gte: _rent.start } },
                                        { "blocked.end": { $gte: _rent.start, $lte: _rent.end } },
                                        { "blocked.start": { $lte: _rent.start }, "blocked.end": { $gte: _rent.end } },
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    $match: {
                        $and: [
                            { 'orders': { $size: 0 } },
                            { 'orderconfigs': { $size: 0 } }
                        ],
                        // 'orders': { $size: 0 }
                    }
                }
            ]);

            const groupedProducts = groupBy(foundProducts, p => p._id.toString());

            // console.log({ foundProducts, orders: foundProducts[0].orders });
            if (foundProducts.length !== _productsID.length) {
                return res.status(400).json(codes.CHECKOUT_PRODUCT_NOT_FOUND);
            }
            if (foundProducts.some(p => p.orders.length > 0 || p.orderconfigs.length > 0)) {
                return res.status(400).json(codes.CHECKOUT_PRODUCT_NOT_FOUND);
            }
            // check if products.guests is less than or equal to the product.maxCapacity
            if (products.some(p => p.guests > groupedProducts[p.product][0].maxCapacity)) {
                return res.status(400).json(codes.CHECKOUT_PRODUCT_MAX_CAPACITY);
            }

            const foundDiscount = await Discount.findOne({ code: discount ?? '' });
            const isDiscountValid = foundDiscount?.isValid() ?? false;
            const isDiscountApplicableOnProducts = foundDiscount?.products.every(p => foundDiscount.isApplicable(p));
            if (discount && !isDiscountValid && !isDiscountApplicableOnProducts) {
                return res.status(400).json(codes.DISCOUNT_NOT_FOUND);
            }

            const orderProducts = await Promise.all(products.map(async p => {
                const product = groupedProducts[p.product][0];
                const chargeRate = await ChargeRate.findOne({ state: product.location.state, city: product.location.city });
                const total = product.price * duration;
                return {
                    product: product,
                    owner: product.owner,
                    tax: chargeRate?.taxRate ?? 0, // in percentage
                    serviceFee: chargeRate?.serviceFee ?? 0, // in percentage
                    amount: product.price,
                    total,
                    discount: foundDiscount?.calculate(total) ?? 0,
                    guests: p.guests,
                };
            }));


            const productTotalPrice = orderProducts.reduce((acc, p) => {
                const amount = p.total - p.discount;
                const tax = amount * (p.tax / 100);
                const serviceFee = amount * (p.serviceFee / 100);
                return acc + amount + tax + serviceFee;
            }, 0);


            const _order = {
                _id: new ObjectId(),
                user: user,
                products: orderProducts,
                amount: productTotalPrice,
                rent: { start, end },
                discounts: foundDiscount ? { [foundDiscount.code]: null } : {},
            };

            const order = new Order(_order);
            await order.save();
            await controller.requestPayment(_order, res);
            if (res.headersSent) return;
            res.redirect('/');
        } catch (error) {
            verbose(error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.all('/webhook/stripe',
    express.raw({ type: "*/*" }),
    async (req, res, next) => {
        try {
            const STRIPE_SIGNIN_SECRET = process.env.STRIPE_SIGNIN_SECRET;
            const STRIPE_SIGNATURE = req.headers['stripe-signature'];
            let event;
            try {
                event = stripe.webhooks.constructEvent(req.rawBody, STRIPE_SIGNATURE, STRIPE_SIGNIN_SECRET);
            } catch (err) {
                debug(err);
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }
            debug(`Received event ${event.id} type ${event.type}`);
            // Handle the event
            switch (event.type) {
                case 'checkout.session.completed':
                case 'checkout.session.async_payment_succeeded':
                    const session = event.data.object;
                    const order = session.metadata.order;
                    await controller.onPaymentSuccess(order, res, { id: session.id, gateway: 'stripe' }, session.metadata);
                    break;
                default:
                    debug(`Unhandled event type ${event.type}`);
            }

        } catch (error) {
            debug(error);
            next(error);
        }
    }
);