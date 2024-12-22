const mongoose = require('mongoose');
const Category = require('../model/Category');
const Product = require('../model/Product');
const paginations = require('../utils/paginations');
const havePermission = require('../middlewire/havePermission');
const multer = require('../config/multer');
const { BAD_REQUEST, PRODUCT_NOT_FOUND, FORBIDDEN } = require('../errors/codes');
const { body, oneOf, param } = require('express-validator');
const reportExpressValidator = require('../middlewire/reportExpressValidator');
const router = require('express').Router();
const debug = require('debug')("app:routes:product");
const verbose = require('debug')("verbose:app:routes:product");
const path = require('path');
const fs = require('fs/promises');
const os = require('os');
const productMailService = require('../service/mail/product');
const Notification = require('../model/Notification');

router.get('/',
    havePermission('product', ['readAny', 'readOwn'], true),
    async (req, res, next) => {
        try {
            const query = { hidden: false, draft: false, approved: true };
            if (req.query.categories) {
                query.categories = req.query.categories;
            }
            if (req.query.amenities) {
                const amenities = req.query.amenities.map(amenity => new mongoose.Types.ObjectId(amenity.toString()));
                query.amenities = { $in: amenities };
            }
            if (req.query.price) {
                // const [min, max] = req.query.price.split('-');
                // check if query.price is a range
                const [min, max] = req.query.price;
                if (min && max) query.price = { $gte: min, $lte: max };
                if (min && !max) query.price = { $gte: min };
                if (!min && max) query.price = { $lte: max };
            }
            if (req.query.name) {
                query.$text = { $search: req.query.name };
            }

            if (req.query.id !== undefined) {
                query.id = req.query.id || undefined;
            }

            // delete req.query.date;
            delete req.query.name;

            const canReadAny = res.locals.ac.readAny();
            const canReadOwn = res.locals.ac.readOwn();

            if (req.query.approved) req.query.approved = req.query.approved === 'true' || req.query.approved === '1';
            if (req.query.hidden) req.query.hidden = req.query.hidden === 'true' || req.query.hidden === '1';
            if (req.query.draft) req.query.draft = req.query.draft === 'true' || req.query.draft === '1';

            if (!canReadAny.granted) {
                query.owner = req.user._id;
                delete query.hidden;
                delete query.draft;
                delete query.approved;

                if (req.query.draft !== undefined) query.draft = req.query.draft;
                if (req.query.hidden !== undefined) query.hidden = req.query.hidden;

            }
            if (canReadAny.granted && canReadOwn.granted) {
                delete query.hidden;
                delete query.approved;
            }
            if (+req.query.maxCapacity) {
                query.maxCapacity = { $gte: +req.query.maxCapacity };
            }

            delete req.query.maxCapacity;

            await paginations.paginateWithMaterialReactTable({
                req,
                parseMongoID: true,
                filter: (_query) => ({ ..._query, ...query }),
                total: query => Product.countDocuments(query),
                handler: async (options, data, extra) => {
                   
                    debug(extra);
                    let products = await Product.fetch(extra.query, { ...options, ...extra })
                        .then(products => JSON.parse(JSON.stringify(products)));

                        // /cart
                        // console.log("this is data", data);
                        // console.log(products ,"this is product");
                    // debug(products);
                    // if user can read own and not read any, filter the products
                    // if (canReadOwn.granted) {
                    //     products = canReadOwn.filter(products);
                    // }
                    // if user can read any and not read own, filter the products
                    // if (canReadAny.granted) {
                    //     products = canReadAny.filter(products);
                    // }
                    // console.log("this is data", products);
                    res.json({
                        products,
                        ...data,
                        next: data.nextPage ? req.baseUrl + `?page=${data.nextPage}` : null,
                        prev: data.prevPage ? req.baseUrl + `?page=${data.prevPage}` : null,
                        message: "success"
                    });
                }

            });

            //BS: 
            const id = req.query.id;
            if (id !== undefined && req.user.role === 'user') {
                await Product.findOneAndUpdate({ id }, { $inc: { views: 1 } });
                const currentDate = new Date();
                const view = {
                    view: 1,
                    createdAt: currentDate,
                };
                await Product.findOneAndUpdate({ id }, { $push: { viewsdetails: view } });
            }
                
                


            //     await paginate({
            //         total: Product.countDocuments(query),
            //         page: req.query.page,
            //         start: req.query.start,
            //         size: req.query.size,
            //         handler: async (options, data) => {
            //             // debug(query);
            //             // debug(req.query);

            //             var products = await Product.fetch(query, options);
            //             // debug(products);

            //             // if user can read own and not read any, filter the products
            //             if (canReadOwn.granted) {
            //                 products = canReadOwn.filter(JSON.parse(JSON.stringify(products)));
            //             }
            //             // if user can read any and not read own, filter the products
            //             if (canReadAny.granted) {
            //                 products = canReadAny.filter(JSON.parse(JSON.stringify(products)));
            //             }

            //             res.json({
            //                 products,
            //                 ...data,
            //                 next: data.nextPage ? req.baseUrl + `?page=${data.nextPage}` : null,
            //                 prev: data.prevPage ? req.baseUrl + `?page=${data.prevPage}` : null
            //             });
            //         }
            //     });
        } catch (error) {
            verbose(error);
            next(error);
        }
    }
);





const PATH = path.join(os.tmpdir(), 'product');

router.post('/',
    havePermission('product', ['createAny', 'createOwn']),
    multer.upload(PATH).fields([
        { name: 'images[]', maxCount: 10 },
        { name: 'docs[]', maxCount: 10 }
    ]),
    oneOf([
        body('draft').isBoolean(),
        [
            body('categories').isArray({ min: 1 }),
            body('amenities').isArray({ min: 1 }),
        ]
    ]),
    reportExpressValidator,
    async (req, res, next) => {
        try {
            const errors = [];
            const createOwn = res.locals.ac.createOwn();
            const createAny = res.locals.ac.createAny();

            let data = req.body;

            const images = req.files['images[]']?.map(file => file.filename);
            const docs = req.files['docs[]']?.map(file => file.filename);

            if (!images?.length) errors.push({ path: 'images', msg: 'At least one image is required' });
            if (!docs?.length) errors.push({ path: 'docs', msg: 'At least one document is required' });
            if (errors.length && !data.draft) return res.status(400).json({ errors, ...BAD_REQUEST });

            data.images = images;
            data.docs = docs;

            data = createOwn.filter(data);

            // if user can create own and not create any, set the owner to the user
            if (createOwn.granted && !createAny.granted) {
                data.owner = req.user._id;
                data.verified = false;
            }

            const product = await Product.create(data);
            // copy the images and docs to the product directory
            await copyFiles(product._id, req);

            res.json(product);
        } catch (error) {
            verbose(error);
            next(error);
        }
    }
);

router.patch('/:id/:status(approve|reject|hide|show)',
    havePermission('product', ['updateAny', 'updateOwn']),
    async (req, res, next) => {
        try {
            const id = req.params.id;
            const status = req.params.status;
            const updateOwn = res.locals.ac.updateOwn();
            const updateAny = res.locals.ac.updateAny();

            const query = { _id: id };

            if (!updateAny.granted) query.owner = req.user._id;
            let update = {};

            const product = await Product.findOne(query).populate('owner');
            if (!product) return res.status(404).json(PRODUCT_NOT_FOUND);

            switch (status) {
                case 'approve':
                    update.approved = true;
                    break;
                case 'reject':
                    update.approved = false;
                    break;
                case 'hide':
                    update.hidden = true;
                    break;
                case 'show':
                    update.hidden = false;
                    break;
            }
            update = updateOwn.filter(update);
            const updatedProduct = await Product.findByIdAndUpdate(id, update, { new: true });
            res.json(updatedProduct);

            if (update.approved && product.owner.email) {

                productMailService.sendApprovedEmail({
                    name: product.owner.name,
                    email: product.owner.email,
                    link: process.env.URL_FRONTEND + '/spot/' + product.id
                });

                await Notification.create({
                    title: 'Spot Approved',
                    body: `Your spot ${product.name} has been approved`,
                    user: product.owner._id,
                    type: product.constructor.modelName,
                    reference: product._id
                });
            }
        } catch (error) {
            verbose(error);
            next(error);
        }
    }
);

router.patch('/:id?',
    havePermission('product', ['updateAny', 'updateOwn']),
    // multer.upload(PATH).any(),
    multer.upload(PATH).fields([
        { name: 'images[]', maxCount: 10 },
        { name: 'docs[]', maxCount: 10 }
    ]),
    async (req, res, next) => {
        try {
            let id = req.params.id || req.body._id || new mongoose.Types.ObjectId();
            let data = req.body;
            delete data._id;
            const query = { _id: id };

            const updateOwn = res.locals.ac.updateOwn();
            const updateAny = res.locals.ac.updateAny();

            if (!updateAny.granted) query.owner = req.user._id;

            if (data.amenities) {
                data.amenities = data.amenities.map(amenity => amenity._id ?? amenity);
            }

            if (data.categories) {
                data.categories = data.categories.map(category => category._id ?? category);
            }

            const images = req.files['images[]']?.map(file => file.filename);
            const docs = req.files['docs[]']?.map(file => file.filename);

            data.images = Array.from(new Set([...images ?? [], ...data.images ?? []]));
            data.docs = Array.from(new Set([...docs ?? [], ...data.docs ?? []]));

            data = updateOwn.filter(data);

            // if user can update own and not update any, set the owner to the user
            if (!updateAny.granted) {
                data.owner = req.user._id;
                data.approved = false;
            }
            debug(data);

            // if query is empty, return bad request
            if (Object.keys(query).length === 0) return res.status(400).json(BAD_REQUEST);
            const updatedProduct = await Product.findOneAndUpdate(query, data, { new: true, runValidators: true, upsert: data.draft });
            if (!updatedProduct) return res.status(404).json(PRODUCT_NOT_FOUND);
            await copyFiles(updatedProduct._id, req);
            res.json(updatedProduct);
        } catch (error) {
            verbose(error);
            next(error);
        }
    }
);

router.delete('/:id',
    havePermission('product', ['deleteAny', 'deleteOwn']),
    async (req, res, next) => {
        try {
            const id = req.params.id;
            const deleteAny = res.locals.ac.deleteAny();

            const query = { _id: id };

            if (!deleteAny.granted) query.owner = req.user._id;

            const product = await Product.findOneAndDelete(query);
            if (!product) return res.status(404).json(PRODUCT_NOT_FOUND);

            res.json(product);
        } catch (error) {
            verbose(error);
            next(error);
        }
    }
);

router.get('/:type(images|docs)/:id/:filename',
    async (req, res, next) => havePermission(`product/${req.params.type}`, ['readAny', 'readOwn'], true)(req, res, next),
    param('id').isMongoId(),
    reportExpressValidator,
    async (req, res, next) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) return res.status(404).json(PRODUCT_NOT_FOUND);

            const canReadAny = res.locals.ac.readAny();
            const canReadOwn = res.locals.ac.readOwn();

            // check if the user can only read any 
            const canOnlyReadOwn = canReadOwn.granted && !canReadAny.granted;
            // check if the user is not owner of the product
            const isNotOwner = product.owner.toString() !== req.user._id.toString();
            // if the user can only read own and is not the owner of the product, return forbidden
            if (canOnlyReadOwn && isNotOwner) return res.status(403).json(FORBIDDEN);

            const uploadDir = getProductUploadDir(product._id);

            const directory = path.join(uploadDir, req.params.type);
            const file = path.join(directory, req.params.filename);
            res.sendFile(file);
        } catch (error) {
            verbose(error);
            next(error);
        }
    }
);



router.get('/owner/:id',
    havePermission('product', ['readAny', 'readOwn'], true),
    async (req, res, next) => {
        try {
            const id = req.params.id;
            
            // Ensure the ID is a valid MongoDB ObjectId
            const ownerId = new mongoose.Types.ObjectId(id);

            // Fetch all products with the owner ID matching the param, excluding images field
            const products = await Product.find({ owner: ownerId }, { images: 0 });
            if (!products || products.length === 0) {
                return res.status(404).json(PRODUCT_NOT_FOUND);
            }

            const canReadAny = res.locals.ac.readAny();
            const canReadOwn = res.locals.ac.readOwn();

            // Check if the user can only read own products
            const canOnlyReadOwn = canReadOwn.granted && !canReadAny.granted;

            // Filter products based on ownership if the user can only read their own
            if (canOnlyReadOwn) {
                const userId = req.user._id.toString();

                // Filter out products the user doesn't own
                const ownedProducts = products.filter(product => product.owner.toString() === userId);

                if (ownedProducts.length === 0) {
                    return res.status(403).json(FORBIDDEN);
                }

                // Return only the products the user owns
                return res.json(ownedProducts);
            }

            // If the user can read any product, return all products
            res.json(products);
        } catch (error) {
            verbose(error);
            next(error);
        }
    }
);



module.exports = router;

function getProductUploadDir(product) {
    return path.resolve(multer.BASE_DIR_PATH, 'product', product.toString());
}

/**
 * 
 * @param {string} product 
 * @param {Express.Request} req 
 */
async function copyFiles(product, req) {
    const directory = getProductUploadDir(product);
    const imageDir = path.join(directory, 'images');
    const docsDir = path.join(directory, 'docs');
    await fs.mkdir(imageDir, { recursive: true });
    await fs.mkdir(docsDir, { recursive: true });
    const imageFilesLocations = req.files['images[]'] ?? []; // get the location of the files
    const docsFilesLocations = req.files['docs[]'] ?? []; // get the location of the files
    for (var i = 0; i < imageFilesLocations.length; i++) {
        const file = imageFilesLocations[i];
        const filename = file.filename;
        await fs.copyFile(file.path, path.join(imageDir, filename));//.catch(_ => null); // move the file to the product directory
        await fs.unlink(file.path);//.catch(_ => null); // delete the file from the temp directory
    }
    for (var i = 0; i < docsFilesLocations.length; i++) {
        const file = docsFilesLocations[i];
        const filename = file.filename;
        await fs.copyFile(file.path, path.join(docsDir, filename));//.catch(_ => null); // move the file to the product directory
        await fs.unlink(file.path);//.catch(_ => null); // delete the file from the temp directory
    }
}

