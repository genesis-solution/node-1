const router = require('express').Router();
module.exports = router;

const havePermission = require('../middlewire/havePermission');
const Ledger = require('../model/Ledger');
const paginations = require('../utils/paginations');

router.get('/',
    havePermission('ledger', ['readAny']),
    async (req, res, next) => {
        try {
            const readAny = res.locals.ac.readAny();
            const query = {};

            const start = req.query.startDate;
            const end = req.query.endDate;

            delete req.query.startDate;
            delete req.query.endDate;

            if (start && end) {
                query.createdAt = {
                    $gte: new Date(start),
                    $lt: new Date(end),
                };
            }
            await paginations.paginateWithMaterialReactTable({
                req,
                total: (query) => Ledger.countDocuments(query),
                filter: (_query) => ({ ..._query, ...query }),
                handler: async ({ skip, limit }, data, { sorting, query }) => {
                    const ledgers = await Ledger.find(query)
                        .populate({
                            path: 'order user',
                            populate: {
                                path: 'products user',
                                populate: {
                                    path: 'product owner',
                                    strictPopulate: false,
                                    select: ['name', 'owner', 'id', 'email'],
                                    strictPopulate: false,
                                },
                                strictPopulate: false,
                                select: ['id', 'name', 'email'],
                            },
                            strictPopulate: false,
                            select: ['id', 'name', 'email'],
                        })
                        .populate('cancelation')
                        .populate('refund')
                        .populate({
                            path: 'payouts',
                            strictPopulate: false,
                        })
                        .skip(skip)
                        .limit(limit)
                        .sort({
                            ...sorting ?? {},
                        });
                    const filtered = readAny.filter(JSON.parse(JSON.stringify(ledgers)));
                    res.send({
                        data: filtered,
                        ...data,
                    });
                }
            });

        } catch (error) {
            next(error);
        }
    }
);

router.get('/total',
    havePermission('ledger', ['readAny']),
    async (req, res, next) => {
        try {
            const query = {};
            const start = req.query.startDate;
            const end = req.query.endDate;

            delete req.query.startDate;
            delete req.query.endDate;

            if (start && end) {
                const _start = new Date(start);
                const _end = new Date(end);
                _start.setMonth(_start.getMonth() - 1);
                query.createdAt = {
                    $gte: new Date(_start.getFullYear(), _start.getMonth(), 1),
                    $lt: _end,
                };
                console.log(query.createdAt.$gte.toLocaleDateString(), query.createdAt.$lt.toLocaleDateString());
            }
            const total = await Ledger.aggregate([
                {
                    $match: query,
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                        },
                        total: { $sum: '$amount' },
                    },
                },
            ]);
            const previous = !(start && end) ? null : total.find((t) => t._id.month === query.createdAt.$gte.getMonth() + 1 && t._id.year === query.createdAt.$gte.getFullYear());
            const current = !(start && end) ? null : total.find((t) => t._id.month === query.createdAt.$gte.getMonth() + 2 && t._id.year === query.createdAt.$gte.getFullYear());
            res.send({ total, previous, current });
        } catch (error) {
            next(error);
        }
    }
);