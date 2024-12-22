const debug = require('debug')('app:test:bettersupertest');
const axios = require('axios');

/**
 * Start a server and return an axios instance to make requests
 * @param {import("express").Express} app 
 * @returns {{server: import("http").Server, http: import("axios").AxiosInstance}}
 * @deprecated Use supertest instead
 */
module.exports = (app) => {
    const randomPort = Math.floor(Math.random() * 1000) + 3000;
    const server = app.listen(randomPort);
    debug(`Server started at https://test.appispot.comndomPort}`);
    const http = axios.create({
        baseURL: `https://test.appispot.comndomPort}`,
        validateStatus: () => true
    });
    return {
        server,
        http
    };
};