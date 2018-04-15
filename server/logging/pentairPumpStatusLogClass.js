var PentairMessage = require('./../equipment/pentair/PentairMessages.js');
var PouchDB = require('pouchdb');
// var moment = require('moment');
PouchDB.plugin(require('pouchdb-find'));

module.exports = class LogClass {
  constructor(name, invervalInMin = 5, location = './database/power') {
    this.logStatus;
    this.currentLogs = [];
    this.interval = invervalInMin || 5;

    this.db = new PouchDB(location);

    this.now = new Date();
    this.currentMin = now.getHours();
  }


  shrinkAndSave (logDataForFiveMins) {
    return new Promise ((resolve, revoke) => {
      this.shrink(logDataForFiveMins)
        .then(compactedData => {
          return this.insertAtTime (compactedData);
        })
        .then(resultsFromInsertion => {
          resolve (resultsFromInsertion);
        })
        .catch(err => {
          revoke (err);
        });
    });
  }

  shrink (logDataForFiveMins) {
    return new Promise ((resolve, revoke) => {
      var data;
      var totalWatts = 0;
      var totalRpm = 0;
      if (logDataForFiveMins.length === 0 ) { revoke (new Error ('data should not exist')); }
      for (let data of logDataForFiveMins) {
        totalWatts += data.watt;
        totalRpm += data.rpm;
      }
      resolve({
        pump: logDataForFiveMins[0].pump,
        watts: ~~(totalWatts / logDataForFiveMins.length),
        rpm: ~~(totalRpm / logDataForFiveMins.length)
      });
    });
  }


  log_old (parsedPumpData, pumpName = 'pump1') {
    var now = new Date();
    if (~~(currentMin / this.interval) !== ~~(now.getMinutes() / this.interval)) {
      var tempCurrent = this.currentLogs;
      this.shrinkAndSave(tempCurrent);
      this.currentLogs = [];
    }
    var { destination, watt, rpm } = parsedPumpData;
    if (!destination, !watt, !rpm) {
      return null;
    }
    this.currentLogs.push({
      pumpName,
      pump: PentairMessage.addresses[destination],
      watt,
      rpm
    });
  }


  log (parsedPumpData, pumpName = 'pump1') {
    var now = new Date();
    if (~~(this.currentMin / this.interval) !== ~~(now.getMinutes() / this.interval)) {
      var tempCurrent = this.currentLogs;
      this.currentLogs = [];
      this.shrinkAndSave(tempCurrent)
        .then (results => {
          console.log (results);
        })
        .catch(err => {
          console.log (err);
        })
        .then(() => {
          var { equipment, watt, rpm } = parsedPumpData;
          if (!equipment, !watt, !rpm) {
            return null;
          }
        });

      this.currentLogs.push({
        pumpName,
        pump: PentairMessage.addresses[equipment],
        watt,
        rpm
      });
    }
  }


  findBetweenTime (startTime = new Date(), endTime = new Date()) {
    return new Promise ((resolve, revoke) => {
      if (startTime.constructor.name !== 'Date' || endTime.constructor.name !== 'Date') { revoke(new Error('startTime and endTime must be Date Objects')); }
      if (startTime < endTime) {
        let temp = endTime;
        endTime = startTime;
        startTime = temp;
      }
      this.db.find({
        selector: {
          timeStamp: { $lte: startTime, $gte: endTime }
        }
      }, (err, docs) => {
        if (err) {
          revoke (err);
        } else { resolve(docs.docs); }
      });
    });
  }


  findBetweenTimePromise (startTime = new Date(), endTime = new Date()) {
    if (startTime.constructor.name !== 'Date' || endTime.constructor.name !== 'Date') {
      return new Error('startTime and endTime must be Date Objects');
    }
    if (startTime < endTime) {
      let temp = endTime;
      endTime = startTime;
      startTime = temp;
    }
    return this.db.find({
      selector: {
        timeStamp: { $lte: startTime, $gte: endTime }
      }
    });
  }


  insertAtTime (data) {
    if (!data || typeof data !== 'object') { return new Error ('Data to insert into database should be a object'); }
    data.timeStamp = new Date();
    return this.db.post(data);
  }

  count() {
    return new Promise ((resolve, revoke) => {
      this.db.info()
        .then(data => resolve(data.doc_count))
        .catch(err => revoke (err));
    });
  }


  allDocs() {
    return this.db.allDocs({});
  }
};