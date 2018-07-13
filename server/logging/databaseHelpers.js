var convertToDateObject = require (__dirname + '/../dateHelpers.js').convertToDateObject;

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