const multer = require('multer');
const _path = require('path');
const debug = require('debug')('app:multer');
const verbose = require('debug')('verbose:app:multer');
const fs = require('fs');
const express = require('express');
const randomService = require('../service/random');

const DIR_UPLOADS = process.env.NODE_ENV === 'test' ? 'test/uploads/' : process.env.DIR_UPLOADS || 'uploads';

const BASE_DIR_PATH = _path.resolve(__dirname, '/var/www/', DIR_UPLOADS);

console.log("BASE_DIR_PATH", BASE_DIR_PATH)

// 2b915476f48ee3c7a430df2cd22b1674-noun-outdoor-2314775
module.exports = {
    /**
     * upload
     * @param {String | ((req: Express.Request, file: Express.Multer.File) => Promise<string>)} path directory to upload the file
     * @param {multer.Options} options multer options
     * @returns
     * @example
     * ```js
     * const multer = require('./app/config/multer');
     * const upload = multer.upload('uploads'); // uploads is the directory to upload the file
     * app.post('/upload', upload.single('file'), (req, res) => {
     *    res.send('File uploaded');
     * });
     * ```
     */
    upload: (path, options) => {
        const storage = multer.diskStorage({
            destination: async (req, file, cb) => {
                try {
                    if (typeof path === 'function') {
                        try {
                            path = await path(req, file);
                            if (path === null || path === undefined) return cb(new Error('Invalid path'));
                        } catch (error) {
                            verbose(error);
                            return cb(error);
                        }
                    }
                    const uploadPath = _path.resolve(BASE_DIR_PATH, path);
                    fs.mkdirSync(uploadPath, { recursive: true });

                    cb(null, uploadPath);
                } catch (error) {
                    verbose(error);
                    cb(error);
                }
            },
            filename: (req, file, cb) => {
                try {
                    const random = randomService.randomHex();
                    cb(null, `${random}-${file.originalname}`);
                } catch (error) {
                    verbose(error);
                    cb(error);
                }
            }
        });
        return multer({ storage, ...options });
    },
    /**
     * Serve static file (wrapper of `express.static`)
     * @param {string} path path to serve
     * @returns 
     * @example
     * ```
     * const router = require('express').Router()
     * router.get('/file', static('files'))
     * ```
    */
    static: (path) => {
        return express.static(_path.join(BASE_DIR_PATH, path),);
    },
    BASE_DIR_PATH: BASE_DIR_PATH,

    /**
     * Save file to disk
     * @param {object} params
     * @param {Buffer} params.buffer
     * @param {string} params.path
     * @param {string} params.filename 
     * @returns 
     */
    save: async ({ buffer, path, filename = 'file.bin' }) => {
        try {
            const uploadPath = _path.resolve(BASE_DIR_PATH, path);
            fs.mkdirSync(uploadPath, { recursive: true });
            const random = randomService.randomHex();
            filename = `${random}-${filename}`;
            const filePath = _path.resolve(uploadPath, filename);
            fs.writeFileSync(filePath, buffer);
            return filename;
        } catch (error) {
            debug(error);
            throw error;
        }
    },

    resolvePath: (/** @type {string[]} */ ...paths) => _path.resolve(BASE_DIR_PATH, ...paths),
};