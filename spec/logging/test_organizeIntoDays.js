const rewire = require('rewire');
const organizeIntoDay = rewire (__dirname + '/../../server/logging/organizeIntoDays.js');
const currentLogs = rewire(__dirname + '/../../server/logging/CurrentLogs.js');
const chai = require('chai');
const expect = chai.expect;
const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));

// const fs = require('fs');
// const sinon = require ('sinon');
// const moment = require('moment');

// myModule.__set__("path", "/dev/null");
// myModule.__get__("path"); // = '/dev/null'
var sampleData = PouchDB(__dirname + '/../SampleDatabase/power');

describe ('organizeIntoDays', function () {
  var oldDB, db;
  before ( function (done) {
    oldDB = organizeIntoDay.__get__('db');
    db = PouchDB(__dirname + '/testCurrentDB');

    PouchDB.replicate(sampleData, db)
      .then(results => {
        // db.info().then(console.log);
        // console.log('results:', results);
        organizeIntoDay.__set__('db', db);
        // oldDB.close(function (err) {
        //   err && console.log ('close', err);
        // });
        done();
      });
  });

  after (function () {
    currentLogs.__with__('db', oldDB);
    db.destroy();
  });

  describe ('updateDatabase', function () {
    it('should ', function () {

    });
  });

  describe ('combineIntoHours', function () {
    it('should ', function () {

    });
  });

  describe ('deepSum', function () {
    it('should ', function () {

    });
  });

  describe ('getAndCombineDataIntoHours', function () {
    it('should ', function () {

    });
  });
});