const path = require('path');
const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));


const currentDBLocation = path.resolve(__dirname + '/../database/power');
console.log('location:', currentDBLocation);

var db = new PouchDB(currentDBLocation);


db.find({
  selector:
  {watts:
    { $exists: true }
  }
})
  .then(results => {
    return results.docs.map (element => {
      element.watt = element.watts;
      delete element.watts;

      element.powerUsed = element.wattsTotal;
      delete element.wattsTotal;

      element.wattStandardDeviation = element.standardDeviation;
      delete element.standardDeviation;

      return element;
    });
  })
  .then(data => {
    console.log(data);
  })
  .catch (err => {
    console.log(err);
  });