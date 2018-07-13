'use strict';
const path = require('path');
const Moment = require('moment');
const {getPumpDataBetweenTimes} = require(__dirname + '/databaseHelpers.js');
const {increaseByOneHour, toNextHour, extractDateData} = require (__dirname + '../dateHelpers');
// const Timer = require(path.resolve(__dirname + '/../Classes/Timer.js'));

const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));

const _ = require ('lodash');

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

var db = PouchDB(__dirname + '/../../database/power');


var combineIntoHours = function combineIntoHours(docs) {
  var data = {};
  docs.forEach((doc, index) => {
    var closeDate, farDate, difference, current, prevDate, powerAmount;
    if (doc.rpm === 0) { return; }

    closeDate = new Moment(doc._id);
    // var nextDocDate = docs[index + 1] ? docs[index + 1].startTime : closeDate;

    // console.log('---');
    // console.log('rpm:', doc.rpm);

    prevDate = farDate = new Moment(doc.startTime);

    current = date1 > farDate ? date1 : farDate; // sets the fardate to the search
    difference = (closeDate - farDate);

    // difference = difference || new Moment(nextDocDate) - current;
    if (difference === 0) { return; }
    powerAmount = doc.powerUsed / difference;
    // console.log('difference:', difference);

    var setData = function (current) {
      difference = (current - prevDate);

      let {year, month, day, hour} = extractDateData(current);

      let dataPosition = `${year}.${month}.${day}.${hour}`;

      let currentPower = _.get(data, dataPosition);
      let power = difference * powerAmount + (currentPower || 0);
      if (isNaN(power)) { debugger; }
      // console.log('power', (currentPower || 0), power);
      _.setWith(data, dataPosition, power, Object);
    };

    current = toNextHour(farDate);

    while (current < closeDate) {
      setData (current);
      prevDate = current;
      current = increaseByOneHour(current);
    }
    setData(closeDate);
  });
};


var getAndCombineDataIntoHours = function combineDataIntoHours (database, equipmentName, date1, date2) {
  return new Promise ((resolve) => {

    getPumpDataBetweenTimes(database, equipmentName, date1, date2)
      .then((docs) => {
        combineIntoHours(docs);
        resolve (data);
        console.log('2018', data[2018]);
      });
  });
};


var deepSum = function (object) {
  var type = typeof object;
  if (type !== 'object') {
    return type === 'number' ? object : 0;
  }

  object.sum = Object.keys(object).reduce((sum, element) => {
    var val = object[element];
    return sum + deepSum(val);
  }, 0);
  return object.sum;
};


var title = function (equipmentName) {
  return 'powerSum-' + equipmentName;
};


var updateDatabase = function (database, equipmentName, dataToUpdateWith) {
  var yearsUpdated;
  database.get(title(equipmentName))
    .catch(err => {
      if (err.status === 404) { //missing record error
        return { _id: title(equipmentName)};
      } else {
        throw err;
      }
    })
    .then(doc => {
      console.log('doc:', doc);
      yearsUpdated = Object.keys(dataToUpdateWith);
      _.merge(doc, dataToUpdateWith);
      return doc;
    })
    .then (doc => {
      for (let key in yearsUpdated) {
        deepSum(doc[key]);
      }
      return doc;
    })
    .then(data => {
      return db.put(doc);
    })
    .then(results => {
      console.log('results:', results);
    })
    .catch (err => {
      console.log('err:', err);
    });
};

module.exports = {
  updateDatabase,
  combineIntoHours,
  getAndCombineDataIntoHours,
};

if (process.env.NODE_ENV !== 'PRODUCTION') {
  Object.assign(module.exports, {
    deepSum,
    combineIntoHours
  });
}