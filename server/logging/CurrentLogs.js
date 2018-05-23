// const Average = require ('../Average.js');
// var moment = require('moment');
const path = require('path');
const StandardDeviation = require (path.resolve(__dirname + '/../StandardDeviation.js'));
const TimeTracker = require(path.resolve(__dirname + '/../TimeTracker.js'));
const Timer = require(path.resolve(__dirname + '/../Classes/Timer.js'));
const WeightedAverage = require(path.resolve(__dirname + '/../Classes/WeightedAverage.js'));

var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));

const currentDBLocation = path.resolve(__dirname + '/../../database/current');
const dbLocation = path.resolve(__dirname + '/../../database/power');

var CurrentLogs = class CurrentLogs {
  constructor (interval) {
    this.equipment = {};
    this.currentDB = new PouchDB(currentDBLocation, {revs_limit: 0});
    this.db = new PouchDB(dbLocation);
    this.timerLength = interval || 300000;
  }


  _createDefault (queueName, rpm, watt) {
    if (typeof queueName === 'string' && typeof watt !== 'number' && typeof rpm !== 'number') {
      throw new Error ('queueName should be a string, watt and rpm should be a number');
    }
    return {
      startTime: new Date(),
      _id: queueName,
      dataPoints: [this._composeDataPoint(watt)], //{watt: 'number', data: 'date'}
      rpm
    };
  }

  _createEquipmentInfo (queueName, rpm, watt) {
    this.equipment[queueName] = {
      timer: new Timer(60000, () => {
        var doc = this.equipment[queueName].data;
        this.equipment[queueName].data.dataPoints = [];

        this._updateCurrentDB(queueName, this.equipment[queueName].data)
          .then(results => {

          })
          .catch (err => {

          });
      }),
      data: this._createDefault(queueName, rpm, watt)
    };
  }

  _composeDataPoint (watt) {
    return {
      watt,
      date: new Date()
    };
  }

  _processData (data) {
    var totalPower = 0;
    var sum = 0;
    var sd = new StandardDeviation();
    var weightedAverage = new WeightedAverage();

    var length = data.dataPoints.length;
    for (var i = 0; i < length; i++) {
      if (i !== length - 1) {
        var dateLength = Math.abs(new Date(data.dataPoints[i].date) - new Date(data.dataPoints[i + 1].date));
        var averageWattBetweenTwoTimes = data.dataPoints[i].watt + data.dataPoints[i + 1].watt;
        var adjustedPower = (averageWattBetweenTwoTimes) / 2 / 60 / 60 / 1000 * dateLength;
        totalPower += adjustedPower;
        weightedAverage.add(averageWattBetweenTwoTimes, dateLength);
      }
      sum += data.dataPoints[i].watt;
      sd.addDataPoint(data.dataPoints[i].watt);
    }
    data.wattsTotal = totalPower;
    data.watts = sum / data.dataPoints.length;
    data.standardDeviation = sd.return(sum / data.dataPoints.length);
    return data;
  }

  async _updateMainDatabase (doc) {
    var newdoc = doc;

    if (!!newdoc ) {
      // console.log('fdsfadfs', newdoc._id);
    } else {
      console.log('no doc');
    }
    newdoc.equipment = newdoc._id;
    // console.log(newdoc.dataPoints[newdoc.dataPoints.length - 1].date);
    newdoc._id = newdoc.endTime = newdoc.dataPoints[newdoc.dataPoints.length - 1].date;
    // console.log('doc:', doc);
    var newdoc = this._processData(newdoc);
    // console.log('newdoc:', newdoc);
    delete newdoc.dataPoints;
    delete newdoc._rev;

    // console.log('newdoc', {
    //   watt: newdoc.watt,
    //   rpm: newdoc.rpm,
    //   _id: newdoc._id,
    //   _rev: newdoc._rev
    // });

    try {
      this.db.put(newdoc)
        .then(data => {

        })
        .catch(err => {

        });
    } catch (err) {
      console.log('err Main', err);
    }
  }

  start() {
    return new Promise ((resolve, revoke) => {
      var name;
      var groupOfPromises = [];
      this.currentDB.allDocs({include_docs: true})
        .then(alldocs => {
          if (alldocs.rows.length > 0) {
            for (let docInfo of alldocs.rows) {
              // console.log('rows', alldocs.rows);
              groupOfPromises.push(new Promise ((resolve, revoke) => {
                this._updateMainDatabase(docInfo.doc)
                  .then (resolve)
                  .catch(revoke);
              }));
            }
          }
          return Promise.all(groupOfPromises);
        })
        .then(() => {
          name = this.currentDB.name;
          return this.currentDB.destroy();
        })
        .then(() => {
          this.currentDB = new PouchDB(name, {revs_limit: 0});
        })
        .then(resolve)
        .catch(revoke);
    });
    return module.exports;
  }


  _updateCurrentDB(queueName, replacementDoc) {
    var doc, docDataPoints;
    if (!replacementDoc) {
      // throw new Error ('require a document to update to the Current Database');
      doc = this.equipment[queueName].data;
      this.equipment[queueName].data = replacementDoc;
    } else {
      docDataPoints = this.equipment[queueName].data.dataPoints;
      this.equipment[queueName].data.dataPoints = [];
      doc = Object.assign({}, this.equipment[queueName].data);
      doc.dataPoints = docDataPoints;
    }

    this.currentDB.get(queueName)
      .then(returnedDoc => {
        returnedDoc.dataPoints.push(...doc.dataPoints);
        var processedData = this._processData(returnedDoc);
        returnedDoc._id = returnedDoc.dataPoints[returnedDoc.dataPoints.length - 1].date;
        doc = returnedDoc;
        // this.equipment[queueName].data = returnedDoc;
      })
      .catch(err => {
        if (err.error && err.status === 404) {
          // return doc;
        } else {
          console.log('ERROR 1', err);
        }
      })
      .then(() => {
        return this.db.put(doc);
      })
      .then(currentDatabaseUpdateResults => {

      })
      .catch(err => {
      });
  }

  addData(queueName, watt, rpm) {
    var doc;

    if (typeof watt !== 'number' || typeof rpm !== 'number') {
      throw new Error ('Watt and RPM must be numbers');
    }
    // var timeTracker = new TimeTracker('start');

    if (!this.equipment[queueName]) {
      this._createEquipmentInfo(queueName, rpm, watt);

    } else if (this.equipment[queueName].data.rpm === rpm) {
      this.equipment[queueName].data.dataPoints.push(this._composeDataPoint(watt));

    } else if (this.equipment[queueName].data.rpm !== rpm) {
      this._updateCurrentDB(queueName, this._createDefault(queueName, rpm, watt));

    } else {
      throw new Error ('AddData something happened that was not expected');
    }
  }
};

module.exports = new CurrentLogs();