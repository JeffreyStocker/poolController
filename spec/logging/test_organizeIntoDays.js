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

describe ('organizeIntoDays', function () {
  var oldDB = organizeIntoDay.__get__('db');
  before ( function (done) {
    oldDB.close(function (err) {
      err && console.log (err);
      organizeIntoDay.__set__('db', PouchDB('./testCurrentDB'));
      done();
    });
  });

  after (function () {
    // currentLogs.__with__()
  });
  describe ('', function () {
    it('should ', function () {

    });
  });
});