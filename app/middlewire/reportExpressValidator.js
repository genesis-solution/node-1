const { validationResult } = require("express-validator");
const { BAD_REQUEST } = require("../errors/codes");
/**
 * Check if there are errors in the request
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 * @returns 
 */
module.exports = (req, res, next) => {
    const errors = validationResult(req).array();
    if (errors.length) return res.status(400).json({ errors, ...BAD_REQUEST });
    next();
};