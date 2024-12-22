const router = require('express').Router();
module.exports = router;
const havePermission = require('../middlewire/havePermission');
const Featured = require('../model/Featured');
const Product = require('../model/Product');
const debug = require('debug')('app:routers:feature');

router.get('/',
    havePermission('feature', ['readAny'], true),
    async (req, res, next) => {
        try {
            const readAny = res.locals.ac.readAny();

            const featured = await Featured.find();
            const products = await Product.fetch({
                _id: { $in: featured.map(f => f.product) }
            }, { limit: 4, });
            // debug(products);
            res.send(readAny.filter(JSON.parse(JSON.stringify(products))));
        } catch (error) {
            debug(error);
            next(error);
        }
    }
);

router.post('/',
    havePermission('feature', ['createAny']),
    async (req, res, next) => {
        try {
            const product = await Product.findOne({ id: req.body.product });
            if (!product) {
                return res.status(404).send();
            }
            const featured = await Featured
                .findOneAndUpdate({ product: product._id }, { product: product._id }, { upsert: true, new: true })
                .populate('product');
            res.send(featured);
        } catch (error) {
            debug(error);
            next(error);
        }
    }
);


router.delete('/product/:id',
    havePermission('feature', ['deleteAny']),
    async (req, res, next) => {
        try {
            const featured = await Featured.findOneAndDelete({ product: req.params.id });
            if (!featured) {
                return res.status(404).send();
            }
            res.send(featured);
        } catch (error) {
            debug(error);
            next(error);
        }
    }
);

