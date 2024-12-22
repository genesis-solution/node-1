const router = require('express').Router();
module.exports = router;
const havePermission = require('../middlewire/havePermission');
const Ledger = require('../model/Ledger');
const Payout = require('../model/Payout');
const paginations = require('../utils/paginations');
const debug = require('debug')('app:routes:payout');

router.get('/',
    havePermission('payout', ['readOwn']),
    async (req, res, next) => {
        try {
            const readAny = res.locals.ac.readAny();
            const readOwn = res.locals.ac.readOwn();

            const query = {};
            if (!readAny.granted) {
                query.user = req.user;
            }
            await paginations.paginateWithMaterialReactTable({
                req,
                filter: (_q) => ({ ...query, ..._q }),
                total: (q) => Payout.countDocuments(q),
                handler: async (options, data, { sorting, query }) => {
                    const _query = Payout.find(query)
                        .populate({
                            path: 'order',
                            populate: {
                                path: 'products user',
                                populate: {
                                    path: 'product',
                                    select: 'name id',
                                    strictPopulate: false,
                                },
                                select: 'id name email',
                                strictPopulate: false,
                            },
                            strictPopulate: false,
                        })
                        .populate('user', 'name email id')
                        .populate('cancelation')
                        .populate('refund')
                        .skip(options.skip)
                        .limit(options.limit);
                    if (sorting) {
                        _query.sort(sorting);
                    }
                    const result = await _query;
                    const filtered = readOwn.filter(JSON.parse(JSON.stringify(result)));
                    res.json({
                        data: filtered,
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
    havePermission('payout', ['updateAny']),
    async (req, res, next) => {
        try {
            const updateAny = res.locals.ac.updateAny();
            const data = updateAny.filter(req.body);
            const id = req.params.id;
            const payout = await Payout.findById(id);
            if (!payout) {
                return res.status(404).send('Payout not found');
            }
            if (data.status === 'paid' && payout.status !== 'paid') {
                await Ledger.create({
                    user: payout.user,
                    amount: -payout.amount,
                    order: payout.order,
                    type: 'credit', 
                });
            }
            const updated = await Payout.findByIdAndUpdate(id, data, { new: true });
            res.status(200).send(updated);
        } catch (error) {
            debug(error);
            next(error);
        }
    }

);