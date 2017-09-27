const path = require('path');
const fs = require('fs-extra');
const {MongodHelper} = require('mongodb-prebuilt');
const mongoose = require('mongoose');

const PORT = 27017;

/**
 * @private
 * @return {string} the path to the temp directory
 */
function prepareTempStorage() {
  let pathname = path.join(process.cwd(), 'tmp');

  // clear folder if there was anything there before
  fs.removeSync(pathname);

  // create folder. start with a fresh copy
  fs.ensureDirSync(pathname);

  return pathname;
}

/**
 * Connect mongoose to the given url
 * @private
 * @param {string} url - the url to mongodb database
 * @return {Promise}
 */
exports.connect = function() {
  return new Promise((resolve, reject) => {
    mongoose.Promise = Promise;
    mongoose.connect(`mongodb://localhost:${PORT}`, {useMongoClient: true});
    mongoose.connection.on('connected', (err) => {
      if (err) { reject(err);}
      else { resolve(); }
    });
  });
};

/**
 * Disconnect from the mongodb
 * @return {Promise}
 */
exports.disconnect = function() {
  return new Promise((resolve) => {
    mongoose.disconnect(() => {
      resolve();
    });
  });
};


/**
 * Start the in memory server and connect to it.
 * @public
 * @return {Promise}
 */
exports.initialize = function() {
  mongoose.Promise = Promise;
  let tmpDir = prepareTempStorage();
  let mongod = new MongodHelper([
    '--port',PORT,
    '--storageEngine', 'ephemeralForTest',
    '--dbpath', tmpDir,
  ]);

  // FOR OFFLINE mode
  // mongod.mongoBin.mongoDBPrebuilt.binPath = '/Users/jjiron/.mongodb-prebuilt/mongodb-download/a811facba94753a2eba574f446561b7e/mongodb-macOS-x86_64-3.5.5-13-g00ee4f5/bin';

  return mongod.run();
};

/**
 * Reset the database, clear all items
 */
exports.clear = function() {
  let promises = [];

  mongoose.modelNames().forEach((modelName) => {
    let model = mongoose.model(modelName);
    promises.push(model.remove({}));
  });

  return Promise.all(promises);
};