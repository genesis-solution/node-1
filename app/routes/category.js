const Category = require('../model/Category');
const debug = require('debug')('app:routes:category');
const verbose = require('debug')('verbose:app:routes:category');
const haveRole = require('../middlewire/haveRole');
const multer = require('../config/multer');
const { body, validationResult } = require('express-validator');
const path = require('path');
const havePermission = require('../middlewire/havePermission');
const { resources } = require('../model/Grant');

const router = require('express').Router();
module.exports = router;
const PATH = 'category';

router.get('/', async (req, res) => {
    try {
        const categories = await Category.findGrouped();
        res.json(categories);
    } catch (error) {
        verbose(error);
        res.status(500).send();
    }
});

router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findOne({ _id: req.params.id });
        if (!category) return res.status(404).send();
        res.json(category);
    } catch (error) {
        verbose(error);
        res.status(500).send();
    }
});

router.use('/image', multer.static(PATH));

router.post('/', havePermission(resources.category, ['createAny']), multer.upload(PATH).fields([{ name: 'image' }, { name: 'banner' }]), body('name').isString().notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            const { name } = req.body;
            const image = req.files?.['image']?.[0];
            const banner = req.files?.['banner']?.[0];
            if (!image) errors.push({ msg: 'Image is required', path: "image" });
            // if (!banner) errors.push({ msg: 'banner is required', path: "banner" });
            if (errors.length) return res.status(400).json({ errors });

            const imagePath = image.filename;
            const bannerPath = banner?.filename;

            const category = await Category.create({ name, image: imagePath, banner: bannerPath });
            res.status(201).json(category);
        } catch (error) {
            verbose(error);
            res.status(500).send();
        }
    }
);

router.delete('/:id', havePermission(resources.category, ['deleteAny']), async (req, res) => {
    try {
        const category = await Category.findOneAndDelete({ _id: req.params.id });
        if (!category) return res.status(404).send();
        res.status(200).send();
    } catch (error) {
        if (error.name === 'CastError') return res.status(404).send();
        verbose(error);
        res.status(500).send();
    }
});