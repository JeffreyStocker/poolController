const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const sinon = require ('sinon');
const moment = require('moment');
const path =  require('path');

const MathUtils = require(path.resolve(__dirname + '/../../server/MathUtils.js'));


const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));

const dbDir = __dirname + '/testDB';
const dbCurrent = __dirname + '/testCurrentDB';

fs.existsSync(dbDir) || fs.mkdirSync(dbDir);
fs.existsSync(dbCurrent) || fs.mkdirSync(dbCurrent);



const currentLogs = require(__dirname + '/../../server/logging/currentLogs.js');

const reset = function (done) {
  currentLogs.db.destroy()
    .then(() => {
      return currentLogs.currentDB.destroy();
    })
    .then(() => {
      currentLogs.db = new PouchDB(dbDir);
      currentLogs.currentDB = new PouchDB(dbCurrent);
    })
    .then(() => {
      done();
    })
    .catch((err) => {
      console.log(err);
      done(err);
    });
};

describe ('CurrentLogs', function () {
  before (() => {
    currentLogs.db = new PouchDB(dbDir);
    currentLogs.currentDB = new PouchDB(dbCurrent);
  });

  after ((done) => {
    currentLogs.db.destroy()
      .then(() => {
        return currentLogs.currentDB.destroy();
      })
      .then(() => {
        done();
      })
      .catch(err => {
        console.log (err);
        done(err);
      });
  });

  beforeEach((done) => {
    reset(done);
  });

  // afterEach(function (done) {
  // });

  describe ('add', function ( ) {
    // beforeEach(() => {
    // });

    afterEach(() => {
      delete currentLogs.equipment.test1;
    });


    it('should add a datapoint', function () {
      var startTime = new Date();
      currentLogs.addData('test1', 500, 300);
      var endTime = new Date();

      currentLogs.equipment['test1'].timer.stop();

      expect(currentLogs.equipment['test1']).to.property('timer');
      expect(currentLogs.equipment['test1']).to.property('data');
    });


    it ('should be a datapoint between time', function () {
      var startTime = new Date();
      currentLogs.addData('test1', 500, 300);
      currentLogs.equipment['test1'].timer.stop();

      var endTime = new Date();

      var datapoints = currentLogs.equipment['test1'].data.dataPoints;
      var datapoint = datapoints[datapoints.length - 1];

      expect(datapoint.date).to.be.instanceof(Date);
      expect(datapoint.date).to.be.at.within(startTime, endTime);
    });


    it ('should create a datapoint with data property', function () {
      var spy = sinon.spy(currentLogs, '_createEquipmentInfo');
      currentLogs.addData('test1', 500, 300);
      currentLogs.equipment['test1'].timer.stop();

      var data = currentLogs.equipment['test1'].data;
      var datapoint = data.dataPoints[data.dataPoints.length - 1];

      expect(Object.keys(data)).to.deep.equal(['startTime', '_id', 'dataPoints', 'rpm']);
      expect(datapoint.watt).to.equal(500);
      expect(data.rpm).to.equal(300);
      expect(spy.calledOnce).to.be.equal(true);
      spy.restore();
    });


    it ('should throw an error when using non numbers for rpm and watts', function () {
      expect(currentLogs.addData).to.throw();
      expect(() => {
        currentLogs.addData('test1', 'string', 300);
      }).to.throw();
      expect(() => {
        currentLogs.addData('test1', 500, 'string');
      }).to.throw();
      expect(() => {
        currentLogs.addData('test1', [500], 'string');
      }).to.throw();
      expect(() => {
        currentLogs.addData('test1', 500, [300]);
      }).to.throw();
      expect(() => {
        currentLogs.addData('test1', {watt: 500}, 300);
      }).to.throw();
    });
  });


  describe ('start', function () {
    var mainDatabaseRecords;
    var testRpms = [200, 4, 100];
    var testWatts = [500, 200, 555];
    var startDocs = [];
    var startTime = moment().subtract(100, 'seconds');


    for (var [index, rpm] of Object.entries(testRpms)) {
      startDocs.push(currentLogs._createDefault('test' + index, rpm, testWatts[index]));
    }

    // var startDocs = [
    //   currentLogs._createDefault('test1', 500, 200, ),
    //   currentLogs._createDefault('test2', 200, 4, ),
    //   currentLogs._createDefault('test3', 555, 100, )
    // ];

    var createTemp = function (requestedNumbers, startDate) {
      var output = [];
      for (var i = 0; i < requestedNumbers.length; i++ ) {
        output.push({
          watt: requestedNumbers[i],
          date: startTime.add(0.5, 'seconds').toDate()
        });
      }
      return output;
    };

    startDocs[0].dataPoints.push( ...createTemp([100, 120, 100, 300, 500, 500, 500, 400, 100]) );
    startDocs[1].dataPoints.push( ...createTemp([1, 5, 3, 4, 5, 6, 4, 2, 3, 32, 1, 2, 3, 1, 23, 1]));
    startDocs[2].dataPoints.push( ...createTemp([-100, 200, -350, -120, -100, 200, 400, -100]));

    before (done => {
      currentLogs.currentDB.bulkDocs(startDocs)
        .then(results => {
          return currentLogs.start();
        })
        .then(data => {
          return currentLogs.db.allDocs({include_docs: true});
        })
        .then (({rows}) => {
          mainDatabaseRecords = rows.map((doc) => {
            return Object.assign({}, doc.doc);
          });
          // console.log('mainDatabaseRecords:', mainDatabaseRecords);
          done();
        })
        .catch(err => {
          done (err);
        });
    });

    it('should add 3 records to the main database from the currentdatabase ', function () {
      expect(mainDatabaseRecords.length).to.equal(startDocs.length);
    });

    it ('should have rpm identical to starting values', function () {
      for (var record of mainDatabaseRecords) {
        expect(testRpms).to.include(record.rpm);
      }
    });

    it.skip ('should have watt values that are now averages', function () {
      for (var record of mainDatabaseRecords) {
        expect(testWatts).to.not.include(record.watt);
      }
    });


  });

  describe ('_processInfo', function ( ) {
    var testStart, testData;
    var watts = [100, 200, 300, 100, 200, 300];
    var rpm = 200;
    var startTime = moment().subtract(100, 'minutes');

    before(function () {
      testData = currentLogs._createDefault('test1', rpm, watts[0]);
      testData.dataPoints = [];
      for (var i = 0; i < watts.length; i++) {
        testData.dataPoints.push({
          watt: watts[i],
          date: startTime.add( 0.5, 'seconds').toDate()
        });
      }
      // console.log(testData);
      // currentLogs._processData;
    });

    it('should have 3 new property, watts, wattTotal and standardDeviation', function () {
      expect(testData).to.not.haveOwnProperty('watts');
      expect(testData).to.not.haveOwnProperty('standardDeviation');
      expect(testData).to.not.haveOwnProperty('wattsTotal');

      var processedData = currentLogs._processData(testData);
      // console.log(processedData);

      expect(processedData).to.haveOwnProperty('watts');
      expect(processedData).to.haveOwnProperty('standardDeviation');
      expect(processedData).to.haveOwnProperty('wattsTotal');

      expect(processedData.watts).to.equal(200);
      expect(Math.betterRound(processedData.standardDeviation, 5)).to.equal(81.64966);
      expect(Math.betterRound(processedData.wattsTotal, 5)).to.equal(.13889);

      // console.log('processedData:', processedData);

    });

    it ('should have property watts that is an sum of dataPoints watts', function () {


    });
  });

  // describe ('_updateMainDatabase', function () {
  //   it('should ', function () {
  //   });
  // });

});