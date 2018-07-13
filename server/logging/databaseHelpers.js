var convertToDateObject = function (possibleDateObj) {
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

var getPumpDataBetweenTimes = function (database, equipmentName, date1, date2) {
  return new Promise ((resolve, revoke) => {
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
    database.find(searchParameters)
      .then (({docs, warning}) => {
        if (warning) { console.log ('warning', warning); }
        resolve(docs);
      })
      .catch (err => {
        if (err.status = 404) {
          resolve([]);
        } else {
          revoke (err);
        }
      });
  });
};


module.exports = {
  getPumpDataBetweenTimes
};