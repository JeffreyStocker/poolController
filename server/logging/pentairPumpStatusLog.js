var PentairMessage = require('./../equipment/pentair/PentairMessages.js');
var PouchDB = require('pouchdb');
var db = new PouchDB('./database/power');
// var moment = require('moment');
PouchDB.plugin(require('pouchdb-find'));

var logStatus, currentMin;
var currentLogs = [];
var interval = 5;


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
        timeStamp: { $lte: startTime, $gte: endTime }
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
      timeStamp: { $lte: startTime, $gte: endTime }
    }
  });
};


var insertAtTime = function (data) {
  if (!data || typeof data !== 'object') { return new Error ('Data to insert into database should be a object'); }
  data.timeStamp = new Date();
  return db.post(data);
};


var count = function () {
  return db.info();
};


var allDocs = function () {
  return db.allDocs({});
};


module.exports = {
  insertAtTime,
  findBetweenTimePromise,
  findBetweenTime,
  init,
  shrink,
  log,
  shrinkAndSave
};