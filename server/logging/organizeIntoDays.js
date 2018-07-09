'use strict';
const path = require('path');
const Moment = require('moment');
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

var increaseByOneHour = function (input) {
  return Moment(input).add(1, 'hour');
};

var decreaseByOneHour = function (input) {
  return Moment(input).subtract(1, 'hour');
};

var toNextHour = function (input) {
  return Moment(input).endOf('hour').add(1, 'millisecond');
};


var getBetweenTimes = function (database, equipmentName, date1, date2) {
  if (date1 > date2) {
    [date1, date2] = [date2, date1];
  }
  var searchParameters = {
    selector: {
      $and: [
        { _id: {$gte: convertToDateObject(date1)} },
        { _id: {$lte: convertToDateObject(date2)} },
        { equipment: {$eq: equipmentName}}
      ],
      sort: ['_id'],
    }
  };
  return database.find(searchParameters);
};


var convertToDateObject = function (possibleDateObj) {
  if (typeof possibleDateObj !== 'object') {
    throw new Error ('Input should be a Object');
  }

  if (possibleDateObj.constructor.name === 'Date') {
    return possibleDateObj;
  } else if (possibleDateObj.constructor.name === 'Moment') {
    return possibleDateObj.toDate();
  } else {
    return null;
  }
};


var processAndSumData = function(database, equipmentName, date1, date2) {
  getBetweenTimes(database, equipmentName, date1, date2)
    .then((results) => {
      var {docs, warning} = results;
      if (warning) { console.log ('warning', warning); }
      var data = {};
      docs.forEach((doc, index) => {
        var closeDate, farDate, difference, current, year, month, day, prevDate, powerAmount;
        if (doc.rpm === 0) { return; }
        closeDate = new Moment(doc._id);
        // var nextDocDate = docs[index + 1] ? docs[index + 1].startTime : closeDate;

        // console.log('---');
        // console.log('rpm:', doc.rpm);

        current = prevDate = farDate = new Moment(doc.startTime);
        difference = (closeDate - farDate);

        // difference = difference || new Moment(nextDocDate) - current;
        if (difference === 0) { return; }
        powerAmount = doc.powerUsed / difference;
        // console.log('difference:', difference);

        var setData = function (current) {
          difference = (current - prevDate);

          year = current.year();
          month = current.month();
          day = current.day();
          hour = current.hour();

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
      deepSum(data);
      console.log('2018', data[2018]);
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
  return equipmentName;
};


var updateDatabase = function (database, equipmentName, dataToUpdateWith) {
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
      _.merge(doc.data, dataToUpdateWith);
      return doc;
    })
    .then (doc => {
      // return db.put(doc);
    })
    .then(results => {
      console.log('results:', results);
    })
    .catch (err => {
      console.log('err:', err);
    });
};


// processAndSumData(db, 'Pump1', new Moment(), new Moment().subtract(5, 'years'));

updateDatabase(db, 'Pump1');
setTimeout(() => {}, 2000);