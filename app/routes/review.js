const router = require('express').Router();
const { PRODUCT_NOT_FOUND, REVIEW_NOT_FOUND } = require('../errors/codes');
const havePermission = require('../middlewire/havePermission');
const haveRole = require('../middlewire/haveRole');
const Product = require('../model/Product');
const Review = require('../model/Review');
const verbose = require('debug')('verbose:app:routes:review');
const mongoose = require('mongoose');
const pagination = require('../utils/paginations');
const { param } = require('express-validator');
const reportExpressValidator = require('../middlewire/reportExpressValidator');
const message = require('../service/mail/message');


router.get('/',
    havePermission('review', ['readOwn']),
    async (req, res, next) => {
        try {
            const readAny = res.locals.ac.readAny();
            const readOwn = res.locals.ac.readOwn();
            await pagination.paginateWithMaterialReactTable({
                req,
                filter: (query) => readOwn.filter(query ?? {}),
                total: async (query) => await Review.countDocuments(query),
                handler: async (options, data, { sorting, query }) => {
                    if (!readAny.granted) {
                        query.$or = [
                            { user: req.user._id },
                            { approved: true }
                        ];
                    }
                    const reviewsQ = Review.find(query)
                        .skip(options.skip)
                        .limit(options.limit)
                        .populate('user')
                        .populate('target');
                    if (Object.keys(sorting ?? {}).length > 0) reviewsQ.sort(sorting);
                    const reviews = await reviewsQ;
                    console.log(reviews);

                    res.json({
                        reviews:JSON.parse(JSON.stringify(reviews)),
                        ...data
                    });
                }
            });

        } catch (error) {
            verbose.extend(req.url)(error);
            next(error);
        }
    }
);

router.post(
    '/',
    havePermission('review', ['createOwn']),
    async (req, res, next) => {
      const user = req.user;
      let {
        comment,
        rating,
        target,
        owner,
        tags,
        onModel
      } = req.body;
  
      // Ensure that tags is an array
      if (!Array.isArray(tags)) {
        tags = tags ? [tags] : [];
      }
  
      try {
        const review = new Review({
          comment,
          rating,
          target,
          owner,
          tags,
          onModel,
          user: user._id
        });
        await review.save();
        res.status(201).json(review);
      } catch (error) {
        verbose.extend(req.url)(error);
        next(error);
      }
    }
  );

  
router.patch('/:id/reply',
    // havePermission('review', ['createOwn']),
    // param('id').isMongoId().withMessage('Invalid review id'),
    // body('userId').isMongoId().withMessage('Invalid user id'),
    // body('reply').notEmpty().withMessage('Reply is required'),
    async (req, res, next) => {
        try {
            console.log("hi");
            const reviewId = req.params.id; // The review ID from the URL parameter
            const userId = req.body.userId; // The user ID from the request body
            const reply = req.body.reply; // The reply message from the request body

            const review = await Review.findById(reviewId);
            if (!review) {
                return res.status(404).json('Review not found');
            }

            // Check if the user is the owner of the review
            if (review.owner.toString() !== userId) {
                return res.status(403).json({ message: 'You are not the owner of this review' });
            }

            // Add the reply to the review
            review.reply = reply;
            await review.save();

            res.json(review);
        } catch (error) {
            verbose.extend(req.url)(error);
            next(error);
        }
    }
);

router.patch('/:id',
    havePermission('review', ['updateOwn']),
    param('id').isMongoId().withMessage('Invalid review id'),
    reportExpressValidator,
    async (req, res, next) => {
        try {
            const id = req.params.id; // The review ID from the URL parameter
            const user = req.user._id; // The ID of the user making the request
            const updateAny = res.locals.ac.updateAny(); // Check if user has permission to update any review
            const updateOwn = res.locals.ac.updateOwn(); // Check if user has permission to update their own review
            const query = { _id: id };
            if (!updateAny.granted) query.user = user;
            const data = updateOwn.filter(req.body); // The updated review data from the request body
            const review = await Review.findOneAndUpdate(query, data, { new: true });
            if (!review) {
                return res.status(404).json(REVIEW_NOT_FOUND);
            }
            res.json(review);
        } catch (error) {
            verbose.extend(req.url)(error);
            next(error);
        }
    }
);

router.delete('/:id',
    havePermission('review', ['deleteOwn']),
    param('id').isMongoId(),
    reportExpressValidator,
    async (req, res, next) => {
        const canDeleteAny = res.locals.ac.deleteAny().granted;

        const id = req.params.id;
        const query = { _id: id };
        if (!canDeleteAny) query.user = req.user._id;

        try {
            const review = await Review.findOne(query);
            if (!review) {
                return res.status(404).json(REVIEW_NOT_FOUND);
            }
            await Review.deleteOne({ _id: id });
            res.status(200).json(review);
        } catch (error) {
            verbose.extend(req.url)(error);
            next(error);
        }
    }
);


module.exports = router;