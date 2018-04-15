var PentairMessage = require('./../equipment/pentair/PentairMessages.js');
var PouchDB = require('pouchdb');
// var moment = require('moment');
PouchDB.plugin(require('pouchdb-find'));

var logStatus, currentMin, db, interval;
var currentLogs = [];


var init = function (location = './database/power', invervalInMin = 5) {

  var now = new Date();
  currentMin = now.getMinutes();
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
    var totalWatts = 0;
    var totalRpm = 0;

    if (logDataForFiveMins.length === 0 ) {
      return revoke ('No Data for timeperiod, so no need to save');
    }
    for (let data of logDataForFiveMins) {
      totalWatts += data.watt;
      totalRpm += data.rpm;
    }
    dataObject = {
      equipment: logDataForFiveMins[0].equipment,
      watts: ~~(totalWatts / logDataForFiveMins.length),
      rpm: ~~(totalRpm / logDataForFiveMins.length)
    };
    return resolve(dataObject);
  });
};


// var log_old = function (parsedPumpData, pumpName = 'pump1') {
//   var now = new Date();
//   var hour = now.getHours();
//   var day = now.getDate();
//   var min = now.getMinutes();
//   if (~~(currentMin / interval) !== ~~(min / interval)) {
//     var tempCurrent = currentLogs;
//     shrinkAndSave(tempCurrent);
//     currentLogs = [];
//   }
//   var { destination, watt, rpm } = parsedPumpData;
//   if (!destination, !watt, !rpm) {
//     return null;
//   }
//   currentLogs.push({
//     pumpName,
//     pump: PentairMessage.addresses[destination],
//     watt,
//     rpm
//   });
// };


var log = function (parsedPumpData) {
  var now = new Date();
  var min = now.getMinutes();
  debugger;
  if (~~(currentMin / interval) !== ~~(min / interval)) {
    if ( currentLogs.length === 0) {
      console.log ('no data in currentLogs');
    } else {
      var tempCurrent = currentLogs;
      currentLogs = [];
      currentMin = new Date().getMinutes();
      // try {
      // } catch (err) {
      //   console.log (err);
      // }
      // console.log ('currentMin: ' + currentMin);
      // console.log ('min: ' + min);
      // console.log ('interval: ' + interval);
      // console.log ('~~(min / interval): ' + ~~(min / interval));
      // console.log ('~~(currentMin / interval: ' + ~~(currentMin / interval));
      shrinkAndSave(tempCurrent)
        .then (results => {
          console.log (results);
        })
        .catch(err => {
          console.log (err);
        });
    }

    currentLogs.push({
      equipment: PentairMessage.addresses[parsedPumpData.equipment],
      watt: parsedPumpData.watt,
      rpm: parsedPumpData.rpm,
    });
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
  return new Promise ((resolve, revoke) => {
    db.info()
      .then(data => resolve(data.doc_count))
      .catch(err => revoke (err));
  });
};


var allDocs = function () {
  return db.allDocs({});
};


module.exports = {
  allDocs,
  count,
  insertAtTime,
  findBetweenTimePromise,
  findBetweenTime,
  init,
  shrink,
  log,
  shrinkAndSave,
};