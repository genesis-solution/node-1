const { MongoMemoryServer } = require("mongodb-memory-server");
const debug = require("debug")("jest:setup");
module.exports = async function (globalConfig, projectConfig) {
    const mongod = await MongoMemoryServer.create({ replSet: { count: 4 } });
    const uri = mongod.getUri();
    debug("MongoDB URI: %s", uri);
    process.env["MONGODB_URI"] = uri;
    // Set reference to mongod in order to close the server during teardown.
    globalThis.__MONGOD__ = mongod;
};