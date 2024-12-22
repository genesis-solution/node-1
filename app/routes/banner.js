const { default: mongoose } = require('mongoose');
const multer = require('../config/multer');
const havePermission = require('../middlewire/havePermission');
const Banner = require('../model/Banner');
const path = require('path');
const express = require('express');

const router = express.Router();
module.exports = router;
const verbose = require('debug')('verbose:app:routes:banner');

const UPLOAD_PATH = 'banner';

router.get('/', async (req, res) => {
    try {
        const banners = await Banner.find();
        return res.json(banners);
    } catch (error) {
        verbose(error);
        return res.status(500).send();
    }
});

router.use('/image', multer.static(UPLOAD_PATH));

router.post('/',
    havePermission('banner', ['createAny']),
    multer.upload(UPLOAD_PATH).fields([{ name: "banner[]" }]),
    async (req, res) => {
        try {
            const banners = req.files?.['banner[]']
                ?.filter(Boolean)
                ?.map(f => ({ image: f.filename }))
                ?.map(b => new Banner(b));

            if (!banners?.length) {
                res.status(400).send();
                return;
            }
            const banners1 = await Banner.create(banners);
            return res.status(201).json(banners);
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                return res.status(400).send();
            }
            verbose(error);
            return res.status(500).send();
        }
    }
);

router.delete('/:id',
    havePermission('banner', ['deleteAny']),
    async (req, res) => {
        try {
            const banner = await Banner.findByIdAndDelete(req.params.id);
            if (!banner) {
                return res.status(404).send();
            }
            return res.json(banner);
        } catch (error) {
            if (error instanceof mongoose.Error.CastError) {
                return res.sendStatus(400);
            }
            verbose(error);
            return res.status(500).send();
        }
    }
);
