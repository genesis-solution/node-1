const multer = require('../config/multer');
const { SUPPORT_NOT_FOUND, FORBIDDEN } = require('../errors/codes');
const havePermission = require('../middlewire/havePermission');
const Support = require('../model/Support');
const paginations = require('../utils/paginations');
const service = require('../service/support');

const router = require('express').Router();
module.exports = router;

const verbose = require('debug')('verbose:app:routes:support');

const PATH = 'support';

router.post('/',
    havePermission('support', ['createOwn']),
    multer.upload(PATH).array('screenshots[]', 5),
    async (req, res, next) => {
        try {
            let data = {
                title: req.body.title,
                description: req.body.description,
                reference: req.body.reference,
                type: req.body.type,
                status: req.body.status,
                priority: req.body.priority,
                screenshots: req.files.map(file => file.filename),
                user: req.user._id,
                contact: req.body.email ?? req.body.phone ?? req.body.contact,
            };

            const notify = req.body.notify ?? true;

            const canCreateAny = res.locals.ac.createAny();
            const canCreateOwn = res.locals.ac.createOwn();

            data = canCreateOwn.filter(data);

            if (canCreateAny.granted) {
                data.user = req.body.user || req.user._id;
            } else {
                data.user = req.user._id;
            }

            const support = await Support.create(data);
            res.status(201).send({ _id: support._id, id: support.id, title: support.title });
            if (notify) await service.notify(support);
        } catch (error) {
            verbose(error);
            next(error);
        }

    }
);

router.patch('/:id',
    havePermission('support', ['updateOwn']),
    multer.upload(PATH).array('screenshots[]', 5),
    async (req, res, next) => {
        try {
            const canUpdateOwn = res.locals.ac.updateOwn();
            const canUpdateAny = res.locals.ac.updateAny();

            const notify = req.body.notify ?? true;

            const { id } = req.params;
            const query = { _id: id };
            if (!canUpdateAny.granted) query.user = req.user._id;

            const support = await Support.findOne(query);

            if (!support) {
                return res.status(404).send(SUPPORT_NOT_FOUND);
            }


            let data = {
                title: req.body.title,
                description: req.body.description,
                reference: req.body.reference,
                type: req.body.type,
                status: req.body.status,
                priority: req.body.priority,
                user: req.body.user,
                contact: req.body.email ?? req.body.phone ?? req.body.contact,
            };

            data = canUpdateOwn.filter(data);

            const newSupport = await Support.findOneAndUpdate(query, data, { runValidators: true, new: true });
            res.status(200).send(); // 
            if (notify) await service.notifyPatch(newSupport)
        } catch (error) {
            verbose(error);
            next(error);
        }
    }
);

router.get('/',
    havePermission('support', ['readOwn']),
    async (req, res, next) => {
        try {
            const readAny = res.locals.ac.readAny();
            const readOwn = res.locals.ac.readOwn();
            const query = readAny.granted ? {} : { user: req.user._id };
            await paginations.paginateWithMaterialReactTable({
                req,
                total: (query) => Support.countDocuments(query),
                filter: (_query) => ({ ..._query, ...query }),
                handler: async ({ skip, limit }, data, { sorting, query }) => {

                    const supports = await Support.find(query)
                        .populate('user', 'name email id')
                        .skip(skip)
                        .limit(limit)
                        .sort({
                            ...sorting ?? {},
                        });
                    const filtered = readOwn.filter(JSON.parse(JSON.stringify(supports)));
                    res.status(200).send({
                        data: filtered,
                        ...data,
                    });
                }
            });

        } catch (error) {
            verbose(error);
            next(error);
        }
    }
);

router.use('/image',
    havePermission('support', ['readOwn']),
    multer.static(PATH),

);

router.delete('/:id',
    havePermission('support', ['deleteOwn']),
    async (req, res, next) => {
        try {
            const canDeleteAny = res.locals.ac.deleteAny();

            const { id } = req.params;
            const query = { _id: id };
            if (!canDeleteAny.granted) query.user = req.user._id;

            const support = await Support.findOneAndDelete(query);
            if (!support) {
                return res.status(404).send(SUPPORT_NOT_FOUND);
            }
            res.status(200).send();
        } catch (error) {
            verbose(error);
            next(error);
        }
    }
);