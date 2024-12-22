const router = require('express').Router();
module.exports = router;
const { Error } = require('mongoose');
const Cancelation = require('../model/Cancelation');
const Order = require('../model/Order');
const Refund = require('../model/Refund');
const verbose = require('debug')('verbose:app:routes:cancelation');
const havePermission = require('../middlewire/havePermission');
const auth = require('../model/Grant');
const { oneOf, body, param } = require('express-validator');
const reportExpressValidator = require('../middlewire/reportExpressValidator');
const paginations = require('../utils/paginations');
const { FORBIDDEN } = require('../errors/codes');
const Payout = require('../model/Payout');
const cancelationMailService = require('../service/mail/cancelation');
const Notification = require('../model/Notification');

router.post('/',
    havePermission(auth.resources.cancelation, ['createOwn']),
    body('order').isMongoId().withMessage('Order is required'),
    body('reason').optional().isString().isLength({ min: 2 }),
    body('note').optional().isString().isLength({ min: 2 }),
    reportExpressValidator,
    async (req, res, next) => {
        try {
            const { reason, note, order } = req.body;

            const canCreateAny = res.locals.ac.createAny().granted;

            const query = {
                _id: order,
                status: 'confirmed',
            };

            if (!canCreateAny) {
                query.$or = [
                    { user: req.user._id },
                    { 'products.owner': req.user._id },
                ];
            }


            const foundOrder = await Order.findOne(query);
            if (!foundOrder) {
                return res.status(404).json({ message: 'Order not found' });
            }

            const existingCancelation = await Cancelation.findOne({ order });
            if (existingCancelation) {
                return res.status(409) // Conflict
                    .json({ message: 'Cancelation already exists' });
            };
            const cancelation = new Cancelation({
                user: canCreateAny ? foundOrder.user : req.user._id,
                reason: reason || 'Other',
                note: note || reason,
                order: foundOrder?._id,
            });
            await cancelation.save();

            res.status(201).send(cancelation);
        } catch (error) {
            verbose(error);
            next(error);
        }
    }
);
const SERVICE_FEE = 0.1;

router.delete(
  '/cancelation/:id',
  havePermission(auth.resources.cancelation, ['updateAny']),
  async (req, res) => {
    try {
      const { id } = req.params;
      console.log('id', id);

      // Find the cancellation by order ID and remove it
      const result = await Cancelation.findOneAndDelete({ _id: "66cb58e682b2664f9d8bcfd8" });

      if (!result) {
        return res.status(404).json({ message: 'Cancellation not found' });
      }

      res.status(200).json({ message: 'Cancellation deleted successfully' });
    } catch (error) {
      console.error('Server error:', error); // Log the error for debugging
      res.status(500).json({ message: 'Server error', error });
    }
  }
);


router.post('/:status(approve|reject)/:id',
    havePermission(auth.resources.cancelation, ['updateAny']),
    oneOf([
        [
            param('status').equals('approve'),
            body('policy').trim().isIn(['Full refund', 'Partial refund', 'No refund']),
        ],
        [
            param('status').equals('reject'),
            body('note').optional().trim().isString().isLength({ min: 2 }),
        ],
    ]),
    reportExpressValidator,
    async (req, res) => {
        try {
            const status = req.params.status;
            const policy = req.body.policy || 'No refund';
            const approved = status === 'approve' && policy !== 'No refund';

            const cancelation = await Cancelation.findById(req.params.id)
                .populate({
                    path: 'order',
                    populate: {
                        path: 'products user',
                        populate: {
                            path: 'product owner',
                            strictPopulate: false,
                            select: ['name', 'owner', 'id', 'email' , 'location'],

                        },
                        strictPopulate: false,
                        select: ['id', 'name', 'email','chatID'],
                    },
                    strictPopulate: false
                });

            if (!cancelation) {
                return res.status(404).json({ error: 'Cancelation not found' });
            }
            const payout = await Payout.findOne({ order: cancelation.order });
            const order = await Order.findById(cancelation.order._id);

            const start = new Date(cancelation.order.rent.start);
            const end = new Date(cancelation.order.rent.end);
            const duration = Math.ceil((end.getTime() - start.getTime()) / 3.6e6);
            // verbose('Duration:', duration);

            const actualPrice = cancelation.order.products.reduce((acc, product) => acc + ((product.amount * duration) - (product.discount ?? 0)), 0);
            let amount = cancelation.order.amount;

            cancelation.approved = approved;
            cancelation.rejectionNote = req.body.note;
            cancelation.policy = policy;

            // Not needed
            // if (policy === 'No refund') {
            //     amount = 0;
            //     const payout = actualPrice * (1 - SERVICE_FEE);
            //     await Payout.updateOne({ order: cancelation.order }, { amount: payout });
            // }

            if (policy === 'Partial refund') {
                amount = (actualPrice / 2) * (1 - SERVICE_FEE);
                await Payout.updateOne({ order: cancelation.order }, { amount: amount, createdAt: new Date() });
            }

            if (policy === 'Full refund') {
                amount = cancelation.order.amount * (1 - SERVICE_FEE);
                await Payout.deleteOne({ order: cancelation.order });
            }

            if (approved) {
                const refund = await Refund.create({
                    user: cancelation.order.user,
                    amount: amount,
                    order: cancelation.order,
                    cancelation,
                });
                cancelation.refund = refund._id;
                order.status = 'cancelled';
            }


            await order.save();
            await cancelation.save();

            cancelationMailService.sendEmailCancelationToGuest({
                email: cancelation.order.user.email,
                guestName: cancelation.order.user.name,
                spotName: cancelation.order.products.map(p => p.product.name).join(', '),
                startDate: cancelation.order.rent.start.toDateString(),
            });
            //FIXME: it should send email to all owners
            cancelationMailService.sendEmailCancelationToOwner({
                email: cancelation.order.products[0].owner.email,
                hostName: cancelation.order.products[0].owner.name,
                spotName: cancelation.order.products[0].product.name,
                bookingDate: cancelation.order.rent.start.toDateString(),
            });
            await Notification.create({
                user: cancelation.order.user,
                title: 'Cancelation',
                body: `Your cancelation request for ${cancelation.order.products[0].product.name} has been ${approved ? 'approved' : 'rejected'}.`,
                type: cancelation.constructor.modelName,
                reference: cancelation._id,
            });
            await Notification.create({
                user: cancelation.order.products[0].owner,
                title: 'Cancelation',
                body: `We regret to inform you that a guest has canceled their booking for ${cancelation.order.products[0].product.name} on ${cancelation.order.rent.start.toDateString()}.`,
                type: cancelation.constructor.modelName,
                reference: cancelation._id,
            });
            res.status(200).send(cancelation);


        } catch (error) {
            verbose(error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.get('/',
    havePermission(auth.resources.cancelation, ['readOwn']),
    async (req, res, next) => {
        try {
            const readAny = res.locals.ac.readAny().granted;
            const query = readAny ? {} : { user: req.user._id };
            await paginations.paginateWithMaterialReactTable({
                req,
                total: (query) => Cancelation.countDocuments(query),
                filter: (_query) => ({ ..._query, ...query }),
                handler: async ({ skip, limit }, data, { sorting, query }) => {

                    const cancelations = await Cancelation.find(query)
                        .populate({
                            path: 'order',
                            populate: {
                                path: 'products user',
                                populate: {
                                    path: 'product owner',
                                    strictPopulate: false,
                                    select: ['name', 'owner', 'id', 'email','chatID' ,'location'],
                                },
                                strictPopulate: false,
                                select: ['id', 'name'],
                            },
                            strictPopulate: false
                        })
                        .populate('refund')
                        .populate('user', 'name email') // Populate user details
                        .skip(skip)
                        .limit(limit)
                        .sort({
                            createdAt: -1,
                            ...sorting ?? {},
                        });
                    res.status(200).send({
                        data: cancelations,
                        ...data,
                    });
                }
            });


        } catch (error) {
            verbose(error);
            next(error);
        }
    }
);

router.get('/owner/:id', async (req, res, next) => {
    try {
        const ownerId = req.params.id;

        const cancelations = await Cancelation.find({
            'order.products.owner': ownerId
        })
            .populate({
                path: 'order',
                populate: {
                    path: 'products user',
                    populate: {
                        path: 'product owner',
                        strictPopulate: false,
                        select: ['name', 'owner', 'id', 'email' ,'location'],
                    },
                    strictPopulate: false,
                    select: ['id', 'name'],
                },
                strictPopulate: false,
            })
            .populate('refund')
            .sort({ createdAt: -1 });

        res.status(200).send(cancelations);
    } catch (error) {
        verbose(error);
        next(error);
    }
});