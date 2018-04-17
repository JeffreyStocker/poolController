var PentairMessage = require('./../equipment/pentair/PentairMessages.js');
var PouchDB = require('pouchdb');
var moment = require('moment');
PouchDB.plugin(require('pouchdb-find'));

var logStatus, currentMin, db, interval;
var currentLogs = [];


var init = function (location = './database/power', invervalInMin = 5) {

  currentMin = new Date().getMinutes();
  interval = invervalInMin;

  db = new PouchDB(location);
  //only for testings currently
  // db.destroy().then(function (response) {
  //   // success
  //   console.log('destroyed');
  //   db = new PouchDB(location);
  // }).catch(function (err) {
  //   console.log(err);
  // });
  //END: only for testings currently

};

var shrinkAndSave = function (logDataForFiveMins, equipment = 'Pump1') {
  return new Promise ((resolve, revoke) => {
    debugger;
    shrink(logDataForFiveMins)
      .then(compactedData => {
        compactedData.equipment = compactedData.equipment || equipment;
        console.log (compactedData);
        return insertAtTime (compactedData);
      })
      .then(resultsFromInsertion => {
        resolve (resultsFromInsertion);
      })
      .catch(err => {
        revoke (err);
      });
  });
};


var shrink = function (logDataForFiveMins) {
  return new Promise ((resolve, revoke) => {
    var dataObject;
    var totalWatt = 0;
    var totalRpm = 0;

    if (logDataForFiveMins.length === 0 ) {
      return revoke (new Error({
        message: 'No Data for timeperiod, so no need to save',
        number: 0
      }));
    }
    for (let data of logDataForFiveMins) {
      totalWatt += data.watt;
      totalRpm += data.rpm;
    }
    dataObject = {
      equipment: logDataForFiveMins[0].equipment,
      watt: ~~(totalWatt / logDataForFiveMins.length),
      rpm: ~~(totalRpm / logDataForFiveMins.length),
      interval
    };
    return resolve(dataObject);
  });
};


var log = function (parsedPumpData) {
  var min = new Date().getMinutes();
  if (~~(currentMin / interval) !== ~~(min / interval)) {
    if ( currentLogs.length === 0) {
      // console.log ('no data in currentLogs');
    } else {
      var tempCurrent = currentLogs;
      currentLogs = [];
      currentMin = new Date().getMinutes();
      shrinkAndSave(tempCurrent)
        .then (results => {
        })
        .catch(err => {
          if (err.number === 0) {
            return;
          }
          console.log (err);
        });
    }
  }
  currentLogs.push({
    equipment: PentairMessage.addresses[parsedPumpData.equipment],
    watt: parsedPumpData.watt,
    rpm: parsedPumpData.rpm,
  });
};


var findBetweenTime = function(startTime = new Date(), endTime = new Date(), pumpName = 'Pump1') {
  return new Promise ((resolve, revoke) => {
    startTime = typeof startTime === 'string' ? new Date (startTime) : startTime;
    endTime = typeof endTime === 'string' ? new Date (endTime) : endTime;
    if (startTime.constructor.name !== 'Date' || endTime.constructor.name !== 'Date') {
      return revoke(new Error('startTime and endTime must be Date Objects'));
    }
    if (startTime < endTime) {
      let temp = endTime;
      endTime = startTime;
      startTime = temp;
    }
    db.find({
      selector: {
        timeStamp: { $lte: startTime, $gte: endTime },
        equipment: { $eq: pumpName }
      }
    })
      .then (searchResults => resolve(searchResults.docs))
      .catch (err => revoke(err));
  });
};

var past = function (time, amount) {
  if (typeof time === 'string' && typeof amount === 'number') {
    if (time === 'months') {
      return findBetweenTime(moment().subtract(amount, 'months').toDate());
    } else if (time === 'years') {
      return findBetweenTime(moment().subtract(amount, 'years').toDate());
    } else if (time === 'days') {
      return findBetweenTime(moment().subtract(amount, 'days').toDate());
    } else if (time === 'hours') {
      return findBetweenTime(moment().subtract(amount, 'hours').toDate());
    } else {
    }
  } else if (time.constructor.name === 'Moment') {
    return findBetweenTime(time.toDate());
  } else {
    throw new Error('Time should be a string (hours, months, days, years) or a Moment object and amount should be a number to subtract');
  }
};

var insertAtTimeWithTimestamp = function (data) {
  if (!data || typeof data !== 'object') { return new Error ('Data to insert into database should be a object'); }
  data.timeStamp = new Date();
  return db.post(data);
};

var insertAtTime = function (data) {
  return new Promise ((resolve, revoke) => {
    if (!data || typeof data !== 'object') { return new Error ('Data to insert into database should be a object'); }
    data._id = new Date();
    console.log (data);
    db.post(data)
      .then(resolveData => {
        resolve(resolveData);
      })
      .catch(err => {
        if (err.code === 202) {
          if (!errorCount) {
            var errorCount = 0;
          } else if (errorCount > 5) {
            err.secondErrorMessage = 'Attempted to increase the _id count by 1 too may times';
            revoke (err);
          }
          errorCount ++;
          data._id++;
          resolve(insertAtTime(data));
        } else {
          revoke (err);
        }
      });
  });
};


var count = function () {
  return new Promise ((resolve, revoke) => {
    db.info()
      .then(data => resolve(data.doc_count))
      .catch(err => revoke (err));
  });
};


var allDocs = function () {
  return db.allDocs({});
};

var sumAndAverageOfPowerLogs = function (powerLogs) {
  var sumWatt = 0;
  var sumRpm = 0;

  for (log of powerLogs) {
    if (log.watt && log.interval && log.rpm) {
      sumWatt += (log.watt * log.interval) / 60;
      sumRpm += (log.rpm * log.interval) / 60;
    }
  }
  return {
    watt: {
      average: ~~(sumWatt / powerLogs.length),
      sum: ~~sumWatt,
    },
    rpm: {
      average: ~~(sumRpm / powerLogs.length),
      sum: ~~sumRpm,
    }
  };
};


module.exports = {
  allDocs,
  count,
  insertAtTime,
  findBetweenTime,
  init,
  shrink,
  log,
  sumAndAverageOfPowerLogs
};