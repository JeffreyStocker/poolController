const Moment = require('moment');

module.exports.convertToDateObject = function convertToDateObject (possibleDateObj) {
  var dateFromString;
  var type = typeof possibleDateObj;
  if (typeof possibleDateObj !== 'object') {
    throw new Error ('Input should be a Object');
  }

  if (possibleDateObj.constructor.name === 'Date') {
    return possibleDateObj;
  } else if (possibleDateObj.constructor.name === 'Moment') {
    return possibleDateObj.toDate();
  } else if (type === 'string') {
    dateFromString = new Date (possibleDateObj);
    return dateFromString.toString() === 'Invalid Date' ? null : dateFromString;
  } else {
    return null;
  }
};

module.exports.returnEarlierDateFirst = function setDateOrder(earlierTime, laterTime) {
  if (earlierTime < laterTime) {
    [earlierTime, laterTime] = [laterTime, earlierTime];
  }
  return [earlierTime, laterTime];
};


module.exports.increaseByOneHour = function (input) {
  return Moment(input).add(1, 'hour');
};


module.exports.decreaseByOneHour = function (input) {
  return Moment(input).subtract(1, 'hour');
};


module.exports.toNextHour = function (input) {
  return Moment(input).endOf('hour').add(1, 'millisecond');
};


_returnMomentObject = function (momentObject) {
  var type = typeof momentObject;
  if (momentObject.constructor.name === 'Moment') {
  } else if ( momentObject.constructor.name === 'Date') {
    momentObject = Moment(momentObject);
  } else if (type === 'string' || type === 'number') {
    momentObject = Moment(momentObject);
  } else {
    momentObject = Moment(momentObject);
  }

  if (!momentObject.isValid()) {
    throw new Error ('Must be able to be converted to a Moment Object');
  }
  return momentObject;
};


module.exports.extractDateData = function (momentObject) {
  momentObject = _returnMomentObject(momentObject);

  return {
    year: momentObject.year(),
    month: momentObject.month(),
    day: momentObject.day(),
    hour: momentObject.hour(),
  };
};