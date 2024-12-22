//@ts-check
const MongooseError = require('mongoose').Error;
const { MongoError } = require('mongodb');
const { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = require('../errors/codes');

const verbose = require('debug')('verbose:app:errorHandler');

/**
 * 
 * @param {MongoError} error 
 * @returns {[string | any, number, any]}
 */
function handleMongoError(error) {
    const DuplicateKeyError = 11000;

    switch (error.code) {
        case DuplicateKeyError:
            return ['Entity Already Exists in Database', 400, BAD_REQUEST];
        default:
            return [error.message, 500, INTERNAL_SERVER_ERROR];
    }
}

module.exports = (err, req, res, next) => {
    verbose(err);
    if (res.headersSent) {
        return next(err);
    }
    let code = INTERNAL_SERVER_ERROR;
    let message = err.message || INTERNAL_SERVER_ERROR.message;
    let errors = [];
    let statusCode = err.statusCode || 500;

    switch (err.constructor) {
        case MongooseError.ValidationError:
            errors = Object.entries(err.errors ?? {}).map(([path, e]) => ({ path: path, msg: e.reason || e.kind }));
        case MongooseError.CastError:
            statusCode = 400;
            code = BAD_REQUEST;
            break;
        case MongoError:
            [message, statusCode, code] = handleMongoError(err);
            break;
        default:
            break;
    };

    switch (err.code) {
        case 'ENOENT': {
            statusCode = 404;
            code = NOT_FOUND;
            message = code.message;
            break;
        }
        default:
            break;
    }


    res.status(statusCode).json({
        errors,
        code: code.code ?? code,
        message,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : {}
    });
};