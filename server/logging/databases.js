var db = PouchDB(__dirname + '/database/power');
PouchDB.plugin(require('pouchdb-find'));

var database = {};

module.exports.get = function get (databaseName) {
  return database[databaseName] || null;
};

module.exports.set = function set (databaseName, options) {
  var db;
  var potentialDB = module.exports.get(databaseName);

  if (potentialDB) {
    return potentialDB;
  }

  var db = PouchDB(databaseName, options);
  database[databaseName] = db;
  return db;
};
