const Cancelation = require('../model/Cancelation');
const Order = require('../model/Order');
const Product = require('../model/Product');
const Payout = require('../model/Payout');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = require('stripe')(STRIPE_SECRET_KEY);
const groupBy = require('lodash.groupby');
const Ledger = require('../model/Ledger');
const mailService = require('../service/mail/order');
const Notification = require('../model/Notification');
const UserDetails = require('../model/UserDetails');

const fs = require('fs/promises');
const multer = require('../config/multer');
const pdf = require('../service/pdf');

const debug = require('debug')('app:controller:checkout');
const verbose = require('debug')('verbose:app:controller:checkout');

const SERVICE_FEE = 0.1;
const UPLOAD_DIR = 'invoices';


async function requestPayment(order, res) {
    const start = new Date(order.rent.start);
    const end = new Date(order.rent.end);
    const duration = Math.ceil((end.getTime() - start.getTime()) / 3.6e6);
    await Order.updateOne({ _id: order._id }, { $set: { 'transection.gateway': 'stripe' } });

    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: order.products
                            .map(p => p.product.name ?? p.product)
                            .join(', ') + ' for ' + duration + ' hours',
                    },
                    unit_amount: Math.ceil(order.amount * 100),
                },
                quantity: 1,
            },
        ],
        metadata: {
            order: order._id.toString(),
        },
        mode: 'payment',
        success_url: `${process.env.URL_FRONTEND}/postPayment/success`,
        cancel_url: `${process.env.URL_FRONTEND}/postPayment/cancel`,

    });
    // debug('Payment session created', session);
    // set order transection id
    await Order.updateOne({ _id: order._id }, { $set: { 'transection.id': session.id } });

    return res.send(session.url);
}
/**
 * handle payment success
 * @param {string} order 
 * @param {import('express').Response} res 
 * @param {{id: string, gateway: string}} transaction 
 * @param {*} metadata,
 */
async function onPaymentSuccess(order, res, transection, metadata) {
    // add to ledger
    // get order details
    const orderDetails = await Order.findOne({ _id: order })
        .populate('products.product')
        .populate('products.owner')
        .populate('user');
    // console.log(JSON.stringify(orderDetails, null, 2));
    // if order is already paid return 200 OK
    if (orderDetails.transection.status === 'completed') {
        debug('Order already paid', order);
        return res.status(200).send('OK');
    }
    // update order transaction status
    await Order.updateOne({ _id: order }, { $set: { 'transection.status': 'completed', 'transection.metadata': metadata, 'transection.id': transection.id, 'transection.gateway': transection.gateway } });
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const start = orderDetails.rent.start;
    const end = orderDetails.rent.end;
    const duration = Math.ceil((end.getTime() - start.getTime()) / 3.6e6);

    const day = dayNames[start.getDay()];

    const COOLDOWN = 4 * 60 * 60 * 1000; // 4 hours
    const startTime = new Date(start.getTime() - COOLDOWN);

    const _rent = { start: startTime, end: end };

    // get product details
    const foundProducts = await Product.aggregate([
        {
            $match: {
                _id: { $in: orderDetails.products.map(p => p.product._id) },
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

    // check if product is not available or out of stock or stock is less than ordered quantity
    const outOfStockProducts = foundProducts.length !== orderDetails.products.length || foundProducts.some(p => p.orders.length > 0);
    if (outOfStockProducts) {
        // cancel order
        await Cancelation.create({
            user: orderDetails.user,
            reason: 'Out of stock',
            note: 'Product is out of stock',
            order: orderDetails._id
        });
        await Order.updateOne({ _id: order }, { $set: { status: 'out of stock' } });
        debug('Order out of stock', order);
        return res.status(200).send('OK');
    }
    // update order status to confirmed
    await Order.updateOne({ _id: order }, { $set: { status: 'confirmed' } });
    // call after payment success
    await onAfterPaymentSuccess(orderDetails, res);
}

/**
 * 
 * @param {object} order 
 * @param {import('express').Response} res 
 */
async function onAfterPaymentSuccess(order, res) {
    await Ledger.findOneAndUpdate(
        { order: order._id },
        {
            user: order.user,
            amount: order.amount,
            order: order._id,
            type: 'debit',
        }, { upsert: true }
    );
    const start = order.rent.start;
    const end = order.rent.end;
    const duration = Math.ceil((end.getTime() - start.getTime()) / 3.6e6);

    const group = groupBy(order.products, 'owner._id');
    // console.log(group);
    // create payout
    Object.entries(group).forEach(async ([owner, products]) => {
        const amount = products.reduce((acc, p) => acc + ((p.amount * duration) - (p.discount ?? 0)), 0);
        await Payout.findOneAndUpdate(
            { order: order._id, user: owner },
            {
                user: owner,
                amount: amount * (1 - SERVICE_FEE),
                order,
            }, { upsert: true }
        );
    });

    //FIXME: currently only one product is supported

    // TODO: in background
    // send email to customer


    //  send email to host
    mailService.sendEmailOrderConfirmation({
        email: order.user.email,
        hostName: order.products[0].owner.name,
        booking: order,
        eventDate: start.toDateString(),
        spot: order.products[0].product,
        userDetails: order.user,
        checkInDate: start.toDateString(),
        checkInTime: start.toLocaleTimeString(),
        checkOutDate: end.toDateString(),
        checkOutTime: end.toLocaleTimeString(),
        totalRespot: order.amount,
        guestName: order.user.name,
        guestEmail: order.user.email,
        supportEmail: 'support@appispot.com',
    });

    await Notification.create({
        user: order.products[0].owner,
        title: 'Order Confirmation',
        body: `You have received a new order for ${order.products[0].product.name} on ${start.toDateString()}.`,
        type: order.constructor.modelName,
        reference: order._id,
    });
    await Notification.create({
        user: order.user,
        title: 'Order Confirmation',
        body: `Your booking for ${order.products[0].product.name} on ${start.toDateString()} has been confirmed.`,
        type: order.constructor.modelName,
        reference: order._id,
    });


    // return 200 OK if headers are not sent
    if (!res.headersSent) res.status(200).send('OK');

    // create invoice
    const userDetails = await UserDetails.findOne({ user: order.user });

    res.app.render('invoice', { order: order, userDetails, duration }, async (err, html) => {
        if (err) { return debug(err); }
        const directory = multer.resolvePath(UPLOAD_DIR);
        const path = multer.resolvePath(UPLOAD_DIR, `${order._id}`);
        await fs.mkdir(directory, { recursive: true });
        const buffer = await pdf.createHtmlToPDF(html, { path, format: 'A4', printBackground: true });
        verbose('Invoice created', path);
        mailService.sendInvolvedEmail({
            buffer,
            email: order.user.email,
        });
    });
}

/**
 * 
 * @param {string} order 
 * @param {import('express').Response} res 
 */
async function onPaymentFailed(order, res) {
    // set order status to payment failed
    // return 200 OK
}
/**
 * 
 * @param {string} order 
 * @param {import('express').Response} res 
 */
async function onPaymentCancelled(order, res) {
    // set order status to payment cancelled
    // return 200 OK
}

module.exports = {
    requestPayment,
    onPaymentSuccess,
    onPaymentFailed,
    onPaymentCancelled,
    onAfterPaymentSuccess,
};
