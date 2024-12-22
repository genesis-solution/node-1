const multer = require('../config/multer');
const havePermission = require('../middlewire/havePermission');

const router = require('express').Router();
module.exports = router;

const Report = require('../model/Report');
const User = require('../model/User');
const debug = require('debug')('app:routes:report');
const { Notation } = require('notation');

const PATH = 'report';
router.post('/',
    havePermission('report', ['createOwn']),
    multer.upload(PATH).array('screenshots[]', 5),
    async (req, res, next) => {
        try {
            // const { reason, description, entity, reportedBy } = req.body;
            var data = {
                reason: req.body.reason,
                description: req.body.description,
                entity: req.body.entity,
                reportedBy: req.body.reportedBy,
                screenshots: req.files.map(file => file.filename),
                status: req.body.status || undefined, // empty string is not allowed
                rejectedReason: req.body.rejectedReason || undefined, // empty string is not allowed
            };
            console.log(data);
            const createOwn = res.locals.ac.createOwn();
            const createAny = res.locals.ac.createAny();

            // if user is admin, he can create any report
            if (createAny.granted) {
                if (data.reportedBy) {
                    const user = await User.findById(data.reportedBy);
                    console.log({ user });
                    if (!user) {
                        return res.status(404).send();
                    }
                }
                data.reportedBy = data.reportedBy || req.user._id;
            }
            data = createOwn.filter(data);
            data.reportedBy = data.reportedBy || req.user._id; // set the reportedBy to the current user if not provided


            const report = await Report.create(data);
            res.status(201).json(report);
        } catch (error) {
            debug.extend(req.path)(error);
            next(error);
        }
    }
);

