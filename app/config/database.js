const mongoose = require("mongoose");
const debug = require("debug")("app:database");

/**
 * Connect to the database
 * @param {string} dbName 
 * @returns {Promise<mongoose.Mongoose>}
 */
async function connect(dbName = "appispot_new") {
    try {
        debug("Connecting to database");
        mongoose.set("strictQuery", false);
        return await mongoose
            .connect(process.env.MONGODB_URI, { dbName })
            .then((mongoose) => {
                debug("Connected to database");
                return mongoose;
            });
    } catch (err) {
        debug(err);
        throw err;
    }
}

module.exports = { connect };
