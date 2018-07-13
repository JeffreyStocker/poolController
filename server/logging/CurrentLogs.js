// const Average = require ('../math/Average.js');
// var moment = require('moment');
// const TimeTracker = require(path.resolve(__dirname + '/../TimeTracker.js'));
const path = require('path');
const StandardDeviation = require (path.resolve(__dirname + '/../math/StandardDeviation.js'));
const Timer = require(path.resolve(__dirname + '/../Classes/Timer.js'));
const WeightedAverage = require(path.resolve(__dirname + '/../math/WeightedAverage.js'));
const {getPumpDataBetweenTimes} = require(__dirname + '/databaseHelpers.js');
const {returnEarlierDateFirst} = require(__dirname + '/../dateHelpers.js');

var log;
try {
  const internalWinston = require(path.resolve(__dirname + '/winston.js'));
  log = internalWinston.sendToLogs;
} catch (err) {
  log = (function () {
    console.log ('missing logging function, will not log anything in CurrentLogs.js');
    return function () {
      console.log (...arguments);
    };
  })();
}


var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));

const currentDBLocation = path.resolve(__dirname + '/../../database/current');
const dbLocation = path.resolve(__dirname + '/../../database/power');

var initCurrentDB = function () {
  return new PouchDB(currentDBLocation, {revs_limit: 1});
};

var initDB = function () {
  return new PouchDB(dbLocation);
};

// var updateDeletedDoc = function (database, doc) {
//   return new Promise ((resolve, revoke) => {
//     database.put(doc)
//       .then(resolve())
//       .catch(err => {
//         if (err.reason === 'deleted') {
//           database.get(doc._id, {revs: true})
//             .then(results => {

//             });
//         } else if (err) {

//         }
//       });
//     resolve();
//     revoke();
//   });
// };

var _checkForValidDataRange = function (watt, rpm) {
  if (watt > 3000 || watt < 0) {
    return false;
  }
  if (rpm > 3500 || rpm < 0) {
    return false;
  }
  return true;
};

var CurrentLogs = class CurrentLogs {
  constructor (interval) {
    this.equipment = {};
    this.currentDB = new PouchDB(currentDBLocation, {
      revs_limit: 1,
      auto_compaction: true
    });
    this.db = new PouchDB(dbLocation);
    this.timerLength = interval || 300000;
  }

  _createEmptyDefault (queueName, rpm) {
    if (typeof queueName === 'string' && typeof rpm !== 'number') {
      var error = new Error ('queueName should be a string and rpm should be a number');
      log('status', 'error', error);
      throw error;
    }
    return {
      startTime: new Date(),
      _id: queueName,
      equipment: queueName,
      dataPoints: [], //{watt: 'number', data: 'date'}
      rpm
    };
  }


  _createDefault (queueName, rpm, watt) {
    if (typeof watt !== 'number') {
      throw new Error ('watt should be a number');
    }
    var defaultData = this._createEmptyDefault(queueName, rpm);
    defaultData.dataPoints.push(this._composeDataPoint(watt));
    return defaultData;
  }


  _createEquipmentInfo (queueName, rpm, watt) {
    this.equipment[queueName] = {
      timer: new Timer(10000, () => {
        this._updateCurrentDBFromCache(queueName);
      }),
      data: this._createDefault(queueName, rpm, watt)
    };
  }

  _isQueueNameExist(queueName) {
    if (this.equipment[queueName]) {
      return true;
    } else {
      return false;
    }
  }

  _addDataPoint(queueName, watt) {
    if (!this._isQueueNameExist(queueName)) {
      throw new Error('queueName must Exist');
    }
    return this.equipment[queueName].data.dataPoints.push(this._composeDataPoint(watt));
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
    if (length === 1) {
      data.wattStandardDeviation = 0;
    } else {
      for (var i = 0; i < length; i++) {
        if (i !== length - 1) {
          let dateLength = Math.abs(new Date(data.dataPoints[i].date) - new Date(data.dataPoints[i + 1].date));
          let averageWattBetweenTwoTimes = (data.dataPoints[i].watt + data.dataPoints[i + 1].watt) / 2;
          let adjustedPower = averageWattBetweenTwoTimes / 60 / 60 / 1000 * dateLength;
          totalPower += adjustedPower;
          weightedAverage.add(averageWattBetweenTwoTimes, dateLength);
        }
        sum += data.dataPoints[i].watt;
        sd.addDataPoint(data.dataPoints[i].watt);
      }
      data.wattStandardDeviation = sd.return(sum / data.dataPoints.length);
    }
    data.datapointsCount = data.dataPoints.length;
    data.watt = sum / data.dataPoints.length;
    data.powerUsed = totalPower;

    delete data.dataPoints;
    return data;
  }

  // _transferDataFromCurrentDBToMainDatabase (queueName) {
  //   return new Promise ((resolve, revoke) => {
  //     var data = this._getEquipmentData(queueName) || revoke();
  //     this._getCurrentDdByName(queueName)
  //       .then ( (doc) => {
  //         return this._updateMainDatabase(this.combineTwoDataSets(doc, data));
  //       })
  //       .catch(() => {
  //         return this._updateMainDatabase(data);
  //       })
  //       .then(() => {
  //         resolve();
  //       })
  //       .catch((err) => {
  //         revoke(err);
  //       });
  //   });
  // }

  // async _ASYNCtransferDataFromCurrentDBToMainDatabase (queueName) {
  //   var data = this._getEquipmentData(queueName);
  //   var doc = await this._getCurrentDdByName(name);
  //   await this._updateMainDatabase(this.combineTwoDataSets(doc, data));
  // }

  async _updateMainDatabase (doc) {
    if (!doc) {
      throw new Error ('_updateMainDatabase must contain a valid document');
    } else {
      // console.log('fdsfadfs', newdoc._id);
    }
    doc.equipment = doc._id;

    try {
      doc._id = doc.endTime = doc.dataPoints[doc.dataPoints.length - 1].date;
    } catch (err) {
      doc._id = new Date();
    }
    doc.endTime = doc._id;

    doc = this._processData(doc);

    delete doc._rev;

    try {
      var data = await this.db.put(doc);
      return data;
    } catch (err) {
      if (err.status === 400) {
        log ('warn', 'event', err);
      } else if (err.status === 409 ) {
        // console.log('err conflict:', err);
        let returnedDoc = await this.db.get(doc._id);
        doc._rev = returnedDoc._rev;
        return await this.db.put(doc);
      }
    }
  }

  start() {
    return new Promise ((resolve, revoke) => {
      var name;
      var groupOfPromises = [];
      this.currentDB.info()
        .then(info => {
          if (info.doc_count > 0) {
            this.currentDB.allDocs({include_docs: true})
              .then(alldocs => {
                if (alldocs.rows.length > 0) {
                  for (let docInfo of alldocs.rows) {
                    groupOfPromises.push(new Promise ((resolve, revoke) => {
                      this._updateMainDatabase(docInfo.doc)
                        .then(resolve)
                        .catch(err => {
                          log ('error', 'system', err);
                          revoke(err);
                        });
                    }));
                  }
                }
                return Promise.all(groupOfPromises);
              })
              .then(results => {
                results.forEach(element => {
                  console.log('current Logs started: Updated to main DB:', element.id);
                });
              })
              .then(() => {
                name = this.currentDB.name;
                return this.currentDB.destroy();
              })
              .then(() => {
                this.currentDB = initCurrentDB();
                resolve();
              });
          } else {
            resolve();
          }
        })
        .catch(revoke);
    });
  }

  _getDocFromCurrentDB (queueName) {
    return this.currentDB.get(queueName);
  }


  async _updateMainDatabaseFromCacheAndCurrentDB (queueName, rpm, watt) {
    var doc, docDataPoints, returnedDoc, count, mainUpdateResults;
    // console.log('_updateMainDatabaseFromCacheAndCurrentDB');

    if (this._isQueueNameExist(queueName)) {
      if (rpm !== undefined || watt !== undefined) {
        if (typeof rpm !== 'number' && typeof watt !== 'number') {
          throw new Error('rpm and watt must be numbers');
        }
        doc = this.equipment[queueName].data;
        // console.log('doc:', doc);
        this.equipment[queueName].data = this._createDefault(queueName, rpm, watt);
        // console.log('equipment:', this.equipment[queueName].data);
      } else {
        docDataPoints = this.equipment[queueName].data.dataPoints;
        this.equipment[queueName].data.dataPoints = [];
        doc = Object.assign({}, this.equipment[queueName].data);
        doc.dataPoints = docDataPoints;
      }
    } else {
      doc = this._createEmptyDefault(queueName, -1);
    }

    try {
      returnedDoc = await this._getDocFromCurrentDB(queueName);
      returnedDoc.dataPoints.push(...doc.dataPoints);
      this.equipment[queueName].data._rev = returnedDoc._rev;
      this.currentDB.put(this.equipment[queueName].data)
        .then()
        .catch(err => {
          console.log('err with updating currentDB with empty', err);
        });
    } catch (err) {
      returnedDoc = doc;
    }

    count = returnedDoc.dataPoints.length;

    try {
      mainUpdateResults = await this._updateMainDatabase(returnedDoc);
    } catch (err) {
      console.log('err:', err);
      if (err.status === 404) {
        // return doc;
      }
    }
    return {
      count,
      id: mainUpdateResults.id
    };
  }


  _updateCurrentDBFromCache(queueName) {
    var doc, docDataPoints;

    var doc = this._getEquipmentData(queueName);
    if (!doc) {
      return;
    }

    docDataPoints = this.equipment[queueName].data.dataPoints;
    this.equipment[queueName].data.dataPoints = [];
    doc = Object.assign({}, this.equipment[queueName].data);
    doc.dataPoints = docDataPoints;

    this._getDocFromCurrentDB(queueName)
      .then(returnedDoc => {
        returnedDoc.dataPoints.push(...doc.dataPoints);
        return returnedDoc;
      })
      .catch(err => {
        if (err.error && err.status === 404) {
          return doc;
        } else {
          throw err;
        }
        console.log('ERROR 1', err);
      })
      .then((processedDoc) => {
        console.log('_updateCurrentDBFromCache datapoints Length', processedDoc.dataPoints.length);
        return this.currentDB.put(processedDoc);
      })
      .then(currentDatabaseUpdateResults => {

      })
      .catch(err => {
        console.log('err:', err);
      });
  }

  addData(queueName, watt, rpm) {
    var count;

    if (typeof watt !== 'number' || typeof rpm !== 'number') {
      throw new Error ('Watt and RPM must be numbers');
    }

    if (!_checkForValidDataRange(watt, rpm)) {
      return;
    }

    if (!this._isQueueNameExist(queueName)) {
      this._createEquipmentInfo(queueName, rpm, watt);

    } else if (this.equipment[queueName].data.rpm === rpm) {
      count = this._addDataPoint(queueName, watt);
      console.log('addData queueName:', queueName, 'watt:', watt, 'rpm:', rpm, 'count:', count);

    } else if (this.equipment[queueName].data.rpm !== rpm) {
      this._updateMainDatabaseFromCacheAndCurrentDB (queueName, rpm, watt)
        .then(({id, count}) => {
          console.log('main DB successly updated! Count:', count, 'with id:', id);
        })
        .catch(err => {
          console.log('err updating main Database:', err);
          // throw err;
        });

    } else {
      throw new Error ('AddData something happened that was not expected');
    }
  }

  _searchDB (database, startTime, endTime, pumpName) {
    // console.log('start');
    return new Promise ((resolve, revoke) => {
      database.find({
        selector: {
          _id: { $lte: startTime, $gte: endTime },
          equipment: { $eq: pumpName }
        }
      })
        .then(results => {
          console.log('results:', results);
          resolve(results);

        })
        .catch (err => {
          console.log('err:', err);
          revoke(err);
        });
    });
  }


  //FindBetweenCurrentAndPowerDatabase
  findBetweenCurrentAndPowerDatabase (earlierTime = new Date(), laterTime = new Date(), pumpName) {
    if (!pumpName) {
      return Promise.reject(new Error('FindBetweenCurrentAndPowerDatabase should have a pumpName'));
    }

    return new Promise ((resolve, revoke) => {
      earlierTime = typeof earlierTime === 'string' ? new Date (earlierTime) : earlierTime;
      laterTime = typeof laterTime === 'string' ? new Date (laterTime) : laterTime;
      if (earlierTime.constructor.name !== 'Date' || laterTime.constructor.name !== 'Date') {
        return revoke(new Error('earlierTime and laterTime must be Date Objects'));
      }

      [earlierTime, laterTime] = returnEarlierDateFirst(earlierTime, laterTime);

      Promise.all([
        getPumpDataBetweenTimes(this.db, earlierTime, laterTime, pumpName),
        // new Promise ((resolve, revoke) => {
        // this.db.find({
        //   selector: {
        //     _id: { $lte: earlierTime, $gte: laterTime },
        //     equipment: { $eq: pumpName }
        //   }
        // })
        //   .then(results => {
        //     resolve(results.docs);
        //   })
        //   .catch (err => {
        //     console.log ('this.db', err);
        //     resolve ([]);
        //   });
        // }),
        new Promise ((resolve) => {
          this._getDocFromCurrentDB(pumpName)
            .then(doc => {
              try {
                doc._id = doc.endTime = doc.dataPoints[doc.dataPoints.length - 1].date;
              } catch (err) {
                doc._id = doc.endTime = new Date();
              }
              resolve (this._processData(doc));
            })
            .catch(err => {
              console.log ('_getDocFromCurrentDB', err);
              resolve ();
            });
        })
      ])
        .then(searchResults => {
          for (var i = 1; i < searchResults.length; i++) {
            if (!searchResults[i]) {
              continue;
            }
            searchResults[0].push(searchResults[i]);
          }

          return searchResults[0];
        })
        .then (pumpData => {
          console.log('searchResults', pumpData.length);
          resolve(pumpData);
        })
        .catch (err => {
          console.log('FindBetweenCurrentAndPowerDatabase');
          console.table(err);
          revoke(err);
        });
    });
  }

  _getEquipmentData(queueName) {
    if (this._isQueueNameExist(queueName)) {
      return this.equipment[queueName].data;
    } else {
      return undefined;
    }
  }

  _setEquipmentData(queueName, data) {
    if (this._isQueueNameExist(queueName)) {
      this.equipment[queueName].data = data;
    } else {
      throw new Error ('queueName must exist in this.equipment');
    }
  }

  _combineTwoDataSets(data1, data2) {
    data1.dataPoints.push(...data2.datapoints);
    return data1;
  }

  async exit() {
    var allPromises = [];
    var allNames = [];
    for (var [name, equip] of Object.entries(this.equipment)) {
      equip.timer.stop();
      allPromises.push(this._updateMainDatabaseFromCacheAndCurrentDB(name));
      allNames.push(name);
    }
    var results = await Promise.all(allPromises);

    results.forEach((element, i) => {
      element.name = allNames[i];
      return element;
    });

    await this.currentDB.destroy();
    console.log('exit results:', results);
    return results;
  }
};

module.exports = {
  CurrentLogs,
  init() {
    module.exports = new CurrentLogs();
    return module.exports;
  }
};