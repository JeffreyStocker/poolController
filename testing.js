var {getAndCombineDataIntoHours, deepSumArray} = require ('./server/logging/organizeIntoDays');
const PouchDB = require('pouchdb');
const Moment = require('moment');


var db = PouchDB(__dirname + '/database/power');
PouchDB.plugin(require('pouchdb-find'));


getAndCombineDataIntoHours(db, 'Pump1', new Moment(), new Moment().subtract(5, 'years'))
  .then(results => {
    var deep = deepSumArray(results);
    console.log (deep);
  });

// updateDatabase(db, 'Pump1');
setTimeout(() => {}, 2000);
