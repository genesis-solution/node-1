const havePermission = require('../middlewire/havePermission');
const Ledger = require('../model/Ledger');
const Order = require('../model/Order');
const Product = require('../model/Product');
const User = require('../model/User');

const router = require('express').Router();
module.exports = router;
const debug = require('debug')("app:routes:dashboard");

router.get('/',
    havePermission('dashboard', ['readAny']),
    async (req, res, next) => {
        try {
            const products = await Product.countDocuments({ draft: false, });
            const users = await User.countDocuments();
            const today = new Date();
            const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

            const lastlastMonthEnd = new Date(today.getFullYear(), today.getMonth() - 2, 0);


            const ordersToday = await Order.countDocuments({
                status: 'confirmed',
                createdAt: {
                    $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate())
                }
            });

            const ordersLastMonth = await Order.countDocuments({
                status: 'confirmed',
                createdAt: {
                    $gte: lastMonthStart,
                    $lte: lastMonthEnd,
                }
            });


            // balance before last month = revenue till last last month end
            const revenueBeforeLastMonth = await Ledger.aggregate([
                {
                    $match: {
                        createdAt: {
                            $lte: lastlastMonthEnd
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: '$amount'
                        }
                    }
                }
            ]);

            // balance last month = revenue till last month end
            const revenueLastMonth = await Ledger.aggregate([
                {
                    $match: {
                        createdAt: {
                            $lte: lastMonthEnd
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: '$amount'
                        }
                    }
                }
            ]);

            // balance this month = revenue till today
            const revenueThisMonth = await Ledger.aggregate([
                {
                    $match: {
                        createdAt: {
                            $lte: today
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: '$amount'
                        }
                    }
                }
            ]);

            const response = {
                products,
                users,
                ordersToday,
                ordersLastMonth,
                revenueBeforeLastMonth: revenueBeforeLastMonth[0]?.total ?? 0,
                revenueLastMonth: revenueLastMonth[0]?.total ?? 0,
                revenueThisMonth: revenueThisMonth[0]?.total ?? 0,
            };
            res.send(response);

        } catch (error) {
            debug(error);
            next(error);

        }
    }
);