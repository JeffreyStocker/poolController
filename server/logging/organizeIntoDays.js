'use strict';
const path = require('path');
const Moment = require('moment');
const {getPumpDataBetweenTimes } = require(__dirname + '/databaseHelpers.js');
const {increaseByOneHour, toNextHour, extractDateData, convertToDateObject} = require (__dirname + '/../dateHelpers');
// const Timer = require(path.resolve(__dirname + '/../Classes/Timer.js'));

const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));

const _ = require ('lodash');

var log, db;
// var db = PouchDB(__dirname + '/../../database/power');

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



var combineIntoHours = function combineIntoHours(docs, startDate) {
  var data = {};
  docs.forEach((doc) => {
    var closeDate, farDate, difference, current, prevDate, powerAmount;
    if (doc.rpm === 0) { return; }

    closeDate = new Moment(doc._id);
    // var nextDocDate = docs[index + 1] ? docs[index + 1].startTime : closeDate;

    // console.log('---');
    // console.log('rpm:', doc.rpm);

    prevDate = farDate = new Moment(doc.startTime);

    current = startDate > farDate ? startDate : farDate; // sets the fardate to the search
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
  return data;
};


var getAndCombineDataIntoHours = function combineDataIntoHours (database, equipmentName, date1, date2) {
  return new Promise ((resolve) => {
    getPumpDataBetweenTimes(database, equipmentName, date1, date2)
      .then((docs) => {
        // console.log (docs);
        var data = combineIntoHours(docs, date1);
        resolve (data);
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

var deepSumArray = function (object) {

  var recursive = function (object, currentDate) {
    var type = typeof object;
    if (type !== 'object') {
      return type === 'number' ? object : 0;
    }

    Object.keys(object).forEach(element => {
      if (element < 35) {
        if (!object.sumArray) {
          object.sumArray = [];
        }
        object.sumArray[element] = deepSumArray(object[element]);
      }
      deepSumArray(object[element]);
    });

    if (object.sumArray) {
      object.sumArray.forEach ((element, index) => {
        if (element === undefined) {
          object.sumArray[index] = 0;
        }
      });
    }
    return object;
  };
  return recursive(object);
};


var title = function (equipmentName) {
  return 'powerSum-' + equipmentName;
};


var updateDatabase = function (database, equipmentName, dataToUpdateWith) {
  var yearsUpdated, deepSumResults;
  database.get(title(equipmentName))
    .catch(err => {
      if (err.status === 404) { //missing record error
        return { _id: title(equipmentName)};
      } else {
        throw err;
      }
    })
    .then(doc => {
      // console.log('doc:', doc);
      yearsUpdated = Object.keys(dataToUpdateWith);
      _.merge(doc, dataToUpdateWith);
      return doc;
    })
    .then (doc => {
      for (let key in yearsUpdated) {
        deepSumResults = deepSumArray(doc[key]);
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

var dateLevel = {'year': 1, 'month': 2, 'day': 3, 'hour': 4};

var getDateDiff = function getDateDiff (date1, date2, type) {
  [date1, date2] = returnEarlierDateFirst(date1, date2);
  if (!dateLevel[type]) { return null; }
  return date1[type] - date2[type];
};

var getSummaryPumpData = function getSummaryPumpData(equipmentName, date1, date2, level) {
  return new Promise((resolve, revoke) => {
    var date1 = convertToDateObject(date1);
    var date2 = convertToDateObject(date2);
    if (!dateLevel[level]) { return revoke('Level should be on of ' + Object.keys(dateLevel)); }
    if (date1 === null || date2 === null) { return revoke ('Date1 and Date2 must be Dates'); }

    [date1, date2] = returnEarlierDateFirst(date1, date2);

    db.get(title(equipmentName))
      .catch(err => {
        if (err.status === 404) {
          return {};
        } else {
          return revoke ('Database Error: ' + err);
        }
      })
      .then(doc => {
        var yearDiff = getDateDiff(date1, date2, 'year');
        var monthDiff = getDateDiff(date1, date2, 'month');
        var dayDiff = getDateDiff(date1, date2, 'day');
        var hourDiff = getDateDiff(date1, date2, 'hour');
        for (let i = date1.year(); i <= date2.year(); date1++) {

        }


      });

  });
};

module.exports = {
  combineIntoHours,
  getAndCombineDataIntoHours,
  getSummaryPumpData,
  updateDatabase,
};

if (process.env.NODE_ENV !== 'PRODUCTION') {
  Object.assign(module.exports, {
    combineIntoHours,
    deepSum,
    deepSumArray
  });
}