const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const express = require('express');
const errorHandler = require('../middlewire/errorHandler');
const { rateLimit } = require('express-rate-limit');
require('dotenv').config();

/**
 * Configures the express app 
 * @param {import('express').Express} app 
 */
module.exports = app => {

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 2000, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
        standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
        // store: ... , // Redis, Memcached, etc. See below.
    });

    if (process.env.NODE_ENV !== 'test') {
        app.use(logger('dev'));
        app.use('/api', limiter);
    }
    // Body parser
    app.use(express.json({
        verify: (req, res, buf) => {
            req.rawBody = buf;
        }
    }));
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());

    // view engine setup
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));

    // CORS
    const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS.split(',').filter(Boolean);
    app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));

    // trust proxy
    app.set('trust proxy', 1);

    // passport
    require('./passport')(app);

    // routes
    require('./routes')(app);

    // catch 404 
    app.all('/api/*', (_, res) => res.sendStatus(404));

    // react app
    app.use(express.static(path.join(__dirname, '../../public')));
    app.get('/*', (req, res) => res.sendFile(path.join(__dirname, '../../public', 'index.html')));

    // error handler
    app.use(errorHandler);

};