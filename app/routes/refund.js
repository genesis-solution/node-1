const router = require('express').Router();
module.exports = router;

const havePermission = require('../middlewire/havePermission');
const Ledger = require('../model/Ledger');
const Refund = require('../model/Refund');
const paginations = require('../utils/paginations');
const debug = require('debug')('app:routes:refund');

router.get('/',
    havePermission('refund', ['readOwn']),
    async (req, res, next) => {
        try {
            const readAny = res.locals.ac.readAny();
            const query = {};
            if (!readAny.granted) query.user = req.user._id;
            await paginations.paginateWithMaterialReactTable({
                req,
                total: (query) => Refund.countDocuments(query),
                filter: (_query) => ({ ..._query, ...query }),
                handler: async ({ skip, limit }, data, { sorting, query }) => {
                    const refunds = await Refund.find(query)
                        .populate({
                            path: 'order',
                            populate: {
                                path: 'products user',
                                populate: {
                                    path: 'product owner',
                                    strictPopulate: false,
                                    select: ['name', 'owner', 'id', 'email'],
                                    strictPopulate: false,
                                },
                                strictPopulate: false,
                                select: ['id', 'name'],
                            },
                            strictPopulate: false,
                        })
                        .populate('cancelation')
                        .skip(skip)
                        .limit(limit)
                        .sort({
                            createdAt: -1,
                            ...sorting ?? {},
                        });
                    res.status(200).send({
                        data: refunds,
                        ...data,
                    });
                }
            });

        } catch (error) {
            debug(error);
            next(error);
        }
    }
);

router.patch('/:id',
    havePermission('refund', ['updateAny']),
    async (req, res, next) => {
        try {
            const updateAny = res.locals.ac.updateAny();
            const id = req.params.id;
            const data = updateAny.filter(req.body);
            const refund = await Refund.findById(id);
            if (!refund) return res.status(404).send();
            if (data.approved === true && !refund.approved) {
                await Ledger.create({
                    user: refund.user,
                    amount: -refund.amount,
                    order: refund.order,
                    type: 'credit',
                });
            }

            const updated = await Refund.findByIdAndUpdate(id, data, { new: true });

            res.status(200).send(updated);
        } catch (error) {
            debug(error);
            next(error);
        }
    }
);