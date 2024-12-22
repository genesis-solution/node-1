const router = require('express').Router();
module.exports = router;

const havePermission = require('../middlewire/havePermission');
const Testimonial = require('../model/Testimonial');

const debug = require('debug')('app:routes:testimonial');
const multer = require('../config/multer');
const { body, param } = require('express-validator');
const reportExpressValidator = require('../middlewire/reportExpressValidator');

router.get('/',
    havePermission('testimonial', ['readAny'], true),
    async (req, res, next) => {
        try {
            const testimonials = await Testimonial.find()
                .sort({ createdAt: -1 });
            res.json(testimonials);
        } catch (error) {
            debug(error);
            next(error);
        }
    }
);

router.post('/',
    havePermission('testimonial', ['createAny']),
    multer.upload('testimonial').single('user[photo]'),
    body('user.name').isString().isLength({ min: 3 }),
    body('content').isString().isLength({ min: 3 }),
    body('rating').isNumeric(),
    reportExpressValidator,
    async (req, res, next) => {

        try {
            const testimonial = await Testimonial.create({
                ...req.body,
                user: {
                    ...req.body.user,
                    photo: req.file.filename,
                },
            });
            res.json(testimonial);
        } catch (error) {
            debug(error);
            next(error);
        }
    }
);
router.use('/image',
    havePermission('testimonial', ['readAny'], true),
    multer.static('testimonial')
);


router.delete('/:id',
    havePermission('testimonial', ['deleteAny']),
    param('id').isMongoId(),
    reportExpressValidator,
    async (req, res, next) => {
        try {
            const result = await Testimonial.findByIdAndDelete(req.params.id);
            res.json(result);
        } catch (error) {
            debug(error);
            next(error);
        }
    }
);