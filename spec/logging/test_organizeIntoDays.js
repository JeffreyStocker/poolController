const rewire = require('rewire');
const organizeIntoDay = rewire (__dirname + '/../../server/logging/organizeIntoDays.js');
const currentLogs = rewire(__dirname + '/../../server/logging/CurrentLogs.js');
const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const path = require('path');

const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));

var sampleDataLocation = __dirname + '/../SampleDatabase/power';

var copyAllFilesInDir = function (src, target, callback) {
  var promiseArray = [];
  fs.readdir(src, (err, files) => {
    if (err) { return console.log (err); }
    files.forEach(file => {
      promiseArray.push(new Promise(resolve => {
        fs.readFile(path.join(src, file), (err, data) => {
          if (err) {
            console.log ('readFile', file, err);
          } else {
            fs.writeFile(path.join(target, file), data, (err) => {
              if (err) { console.log ('write', file, err); }
              resolve();
            });
          }
        });
      }));
    });
  });
  return Promise.all(promiseArray);
};

describe.only ('organizeIntoDays', function () {
  var oldDB, db;
  before ( function (done) {
    oldDB = organizeIntoDay.__get__('db');
    copyAllFilesInDir(sampleDataLocation, __dirname + '/testCurrentDB')
      .then((results) => {
        db = PouchDB(__dirname + '/testCurrentDB');
        organizeIntoDay.__set__('db', db);
        done();
      });

    // PouchDB.replicate(sampleDataLocation, db)
    //   .then(() => {
    //     done();
    //   })
    //   .catch(err => done('err', err));
  });

  after (function () {
    currentLogs.__set__('db', oldDB);
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