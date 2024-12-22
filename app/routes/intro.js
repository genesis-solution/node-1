const router = require('express').Router();
module.exports = router;
const havePermission = require('../middlewire/havePermission');
const Intro = require('../model/Intro');

router.patch('/',
    havePermission('intro', ['updateOwn']),
    async (req, res, next) => {
        try {
            delete req.body.user;
            const intro = await Intro.findOneAndUpdate({ user: req.user._id }, req.body, { new: true, upsert: true });
            res.json(intro);
        } catch (error) {
            next(error);
        }
    }
);

router.get('/:id?',
    havePermission('intro', ['readOwn'], true),
    async (req, res, next) => {
        try {
            const canReadAny = res.locals.ac.readAny().granted;
            const user = canReadAny ? req.params.id ?? req.user._id : req.user._id;
            const intro = await Intro.findOne({ user: user });
            res.json(intro);
        } catch (error) {
            next(error);
        }
    }
);




