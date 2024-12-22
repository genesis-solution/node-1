const Amenity = require('../model/Amenity');
const debug = require('debug')('app:routes:amenity');
const verbose = require('debug')('verbose:app:routes:amenity');
const haveRole = require('../middlewire/haveRole');
const  multer = require('../config/multer');
const { body, validationResult } = require('express-validator');
const path = require('path');
const havePermission = require('../middlewire/havePermission');
const { resources } = require('../model/Grant');

const router = require('express').Router();
module.exports = router;
const PATH = 'amenity';

router.get('/', async (req, res) => {
    try {
        const amenities = await Amenity.find();
        res.json(amenities);
    } catch (error) {
        verbose(error);
        res.status(500).send();
    }
});


router.post('/', 
    havePermission(resources.amenity, ['createAny']), 
    multer.upload(PATH).single('image'), 
    body('name').isString().notEmpty(),
    async (req, res, next) => {
        try {
            const errors = validationResult(req).array();
            const { name } = req.body;
            const image = req.file
            if (!image) errors.push({ msg: 'Image is required', path: "image" });
            // if (!banner) errors.push({ msg: 'banner is required', path: "banner" });
            if (errors.length) return res.status(400).json({ errors });

            const imagePath = image.filename;

            const amenity = await Amenity.create({ name, image: imagePath, });
            res.status(201).json(amenity);
        } catch (error) {
            verbose.extend(req.path)(error);
            next(error);
        }
    }
);

router.use('/image', multer.static(PATH));

router.delete('/:id', havePermission(resources.amenity, ['deleteAny']), async (req, res) => {
    try {
        const category = await Amenity.findOneAndDelete({ _id: req.params.id });
        if (!category) return res.status(404).send();
        res.status(200).send();
    } catch (error) {
        if (error.name === 'CastError') return res.status(404).send();
        verbose(error);
        res.status(500).send();
    }
});