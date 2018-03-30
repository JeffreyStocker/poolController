var PentairMessage = require('./../equipment/pentair/PentairMessages.js');
var PouchDB = require('pouchdb');
var db = new PouchDB('./database/power');
var Moment = require('moment');
PouchDB.plugin(require('pouchdb-find'));

var logStatus, currentMin;
var currentLogs = [];
var interval = 5;

var timeInMilli = function (type, amount) {
  if (typeof type !== 'string' && typeof amount !== 'number') { return NaN; }
  if (type === 'hour') {
    return amount * 1000 * 60 * 60;

  } else if (type === 'minute') {
    return amount * 1000 * 60;

  } else if (type === 'second') {
    return amount * 1000;

  } else if (type === 'day') {
    return amount * 1000 * 60 * 60 * 24;
  } else {
    return NaN;
  }
};

var init = function (invervalInMin = 5) {
  var now = new Date();
  currentMin = now.getHours();
  interval = invervalInMin || interval;
};

var shrinkAndSave = function (logDataForFiveMins) {
  var compactedData = shrink(logDataForFiveMins);
  insertAtTime (compactedData)
    .then(results => {
      console.log(results);
    })
    .catch(err => {
      console.log(err);
    });
};


var shrink = function (logDataForFiveMins) {
  var data;
  var totalWatts = 0;
  var totalRpm = 0;
  if (logDataForFiveMins.length === 0 ) { return null; }
  for (let data of logDataForFiveMins) {
    totalWatts += data.watt;
    totalRpm += data.rpm;
  }
  return {
    pump: logDataForFiveMins[0].pump,
    watts: ~~(totalWatts / logDataForFiveMins.length),
    rpm: ~~(totalRpm / logDataForFiveMins.length)
  };
};


var log = function (parsedPumpData, pumpName = 'pump1') {
  var now = new Date();
  var hour = now.getHours();
  var day = now.getDate();
  var min = now.getMinutes();
  if (~~(currentMin / interval) !== ~~(min / interval)) {
    var tempCurrent = currentLogs;
    shrinkAndSave(tempCurrent);
    currentLogs = [];
  }
  var { destination, watt, rpm } = parsedPumpData;
  if (!destination, !watt, !rpm) {
    return null;
  }
  currentLogs.push({
    pumpName,
    pump: PentairMessage.addresses[destination],
    watt,
    rpm
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
    throw new Error('Time should be a string (hours, months, days, years or a Moment object and amount should be a number');
  }
};

var findBetweenTime = function (startTime = new Date(), endTime = new Date()) {
  return new Promise ((resolve, revoke) => {
    if (startTime.constructor.name !== 'Date' || endTime.constructor.name !== 'Date') { revoke(new Error('startTime and endTime must be Date Objects')); }
    if (startTime < endTime) {
      let temp = endTime;
      endTime = startTime;
      startTime = temp;
    }
    db.find({
      selector: {
        _id: { $lte: startTime, $gte: endTime }
      }
    }, (err, docs) => {
      if (err) {
        revoke (err);
      } else { resolve(docs.docs); }
    });
  });
};


var findBetweenTimePromise = function(startTime = new Date(), endTime = new Date()) {
  if (startTime.constructor.name !== 'Date' || endTime.constructor.name !== 'Date') {
    return new Error('startTime and endTime must be Date Objects');
  }
  if (startTime < endTime) {
    let temp = endTime;
    endTime = startTime;
    startTime = temp;
  }
  return db.find({
    selector: {
      _id: { $lte: startTime, $gte: endTime }
    }
  });
};


var insertAtTime = function (data) {
  return new Promise ((resolve, revoke) => {
    if (!data || typeof data !== 'object') { return new Error ('Data to insert into database should be a object'); }
    data._id = new Date();
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
  return db.info();
};


var allDocs = function () {
  return db.allDocs({});
};

insertAtTime({name: 'test'});


module.exports = {
  insertAtTime,
  findBetweenTimePromise,
  findBetweenTime,
  init,
  shrink,
  log,
  shrinkAndSave
};


count()
  .then(data => {
    console.log(data);
  });