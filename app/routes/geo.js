const router = require('express').Router();
module.exports = router;
const debug = require('debug')("app:routes:geo");
const geo = require('../service/geo');
const havePermission = require('../middlewire/havePermission');
const { AxiosError } = require('axios');

const cache = require('apicache').middleware;

const MONTH = 3600000 * 24 * 30;

router.get('/reverse',
    havePermission('geo', ['readAny']),
    cache(MONTH * 2),
    async (req, res, next) => {
        try {
            const latitude = parseFloat(req.query.latitude);
            const longitude = parseFloat(req.query.longitude);
            const result = await geo.reverse({ latitude, longitude });
            res.json(result);
        } catch (error) {
            if (error instanceof AxiosError) {
                return res
                    .status(error.response?.status || 500)
                    .json(error.response?.data);
            }
            debug.extend(req.path)(error);
            next(error);
        }
    }
);

