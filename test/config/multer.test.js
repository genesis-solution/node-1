const express = require('express');
const app = express();
const multer = require('../../app/config/multer');
const upload = multer.upload;

const request = require('supertest');
const debug = require('debug')('app:test:multer');

const fs = require('fs');
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


describe('multer', () => {
    describe('upload', () => {
        it('should upload a file to the specied path', async () => {
            const dir = 'test';

            app.post('/api/upload/', upload(dir).single('file'), (req, res) => {
                // debug(req.params);
                // debug(req.file);
                // debug(req.path);
                res.json({ file: req.file, url: req.originalUrl });
            });

            const endpoint = '/api/upload/';
            const res = await request(app)
                .post(endpoint)
                .attach('file', 'test/fixtures/image.jpg');
            expect(res.status).toBe(200);
            expect(res.body.file).toHaveProperty('originalname', 'image.jpg');
            expect(res.body.file).toHaveProperty('destination', path.join(multer.BASE_DIR_PATH, dir));
        });

        it('should upload a file to the specified path using resolver function', async () => {
            const dir = 'test';
            const resolver = (req, file) => {
                return dir;
            };
            const endpoint = '/api/upload/';

            app.post(endpoint, upload(resolver).single('file'), (req, res) => {
                res.json({ file: req.file, url: req.originalUrl });
            });

            const res = await request(app)
                .post(endpoint)
                .attach('file', 'test/fixtures/image.jpg');
            expect(res.status).toBe(200);
            expect(res.body.file).toHaveProperty('originalname', 'image.jpg');
            expect(res.body.file).toHaveProperty('destination', path.join(multer.BASE_DIR_PATH, dir));
        });

        it('should throw an error if the resolver function returns null or undefined', async () => {
            const resolver = (req, file) => {
                return null;
            };
            const endpoint = '/api/upload/';

            app.post(endpoint, upload(resolver).single('file'), (req, res) => {
                res.json({ file: req.file, url: req.originalUrl });
            });

            const res = await request(app)
                .post(endpoint)
                .attach('file', 'test/fixtures/image.jpg');
            expect(res.status).toBe(500);
        });

        it('should throw an error if the resolver function throws an error', async () => {
            const resolver = (req, file) => {
                throw new Error('Invalid path');
            };
            const endpoint = '/api/upload/';

            app.post(endpoint, upload(resolver).single('file'), (req, res) => {
                res.json({ file: req.file, url: req.originalUrl });
            });

            const res = await request(app)
                .post(endpoint)
                .attach('file', 'test/fixtures/image.jpg');
            expect(res.status).toBe(500);
        });

        it('should fileFilter function to filter the files (override)', async () => {
            const dir = 'test';
            const fileFilter = (req, file, cb) => {
                // if (!file.originalname.endsWith('.jpg')) {
                //     return cb(new Error('Only jpg files are allowed'));
                // }
                cb(null, false);
            };
            const endpoint = '/api/upload/';

            app.post(endpoint, upload(dir, { fileFilter }).single('file'), (req, res) => {
                // console.log(req.file, req.files);
                res.json({ file: req.file, files: req.files, url: req.originalUrl });
            });

            const res = await request(app)
                .post(endpoint)
                .attach('file', 'test/fixtures/image.jpg');
            expect(res.status).toBe(200);
            expect(res.body.file).toBeUndefined();
            expect(res.body.file).toBeUndefined();
        });
    });

    describe('static', () => {
        it('should serve the static file from the specified path', async () => {
            const dir = 'test';
            const endpoint = '/api/static/';
            // create the directory
            if (!fs.existsSync(`${multer.BASE_DIR_PATH}/${dir}`)) {
                fs.mkdirSync(`${multer.BASE_DIR_PATH}/${dir}`, { recursive: true });
            }

            // copy the file to the test directory
            fs.copyFileSync('test/fixtures/image.jpg', `${multer.BASE_DIR_PATH}/${dir}/image.jpg`);

            app.use(endpoint, multer.static(dir));

            const res = await request(app)
                .get(endpoint + 'image.jpg');
            expect(res.status).toBe(200);
            expect(res.header['content-type']).toBe('image/jpeg');
        });
    });


    afterEach(() => {
        // remove endpoint
        app._router.stack.pop();
    });
    afterAll(() => {
        if (!multer.BASE_DIR_PATH.includes('test')) return debug('Not deleting the test directory');
        fs.rmSync(`${multer.BASE_DIR_PATH}/`, { recursive: true, force: true });
        debug('Deleted the test directory');
    });
});

