const debug = require('debug')('jest:teardown');
module.exports = async function (globalConfig, projectConfig) {
    await globalThis.__MONGOD__.stop();
    debug('Teardown complete');
};