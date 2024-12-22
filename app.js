const express = require('express');

var app = express();
module.exports = app;

// setup config
require('./app/config')(app);

// database
if (process.env.NODE_ENV !== 'test') {
    require('./app/config/database').connect();
}


