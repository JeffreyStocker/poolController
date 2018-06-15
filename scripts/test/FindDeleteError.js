var pouch = require('pouchdb');

var db = new pouch (__dirname + '/test');

// db.put({_id: 'test'})
//   .then((results) => {
//     return db.remove({_id: results._id, _rev: results.rev});
//   })
db.get('test')
  .then ((results) => {
    console.log('results:', results);
    // return db.put({_id: 'test', _rev: results.rev});
  })
  .catch(err => {
    console.log(err);
  })
  .then(() => {
    db.destroy();
  });


//400 - bad request
//404 - missing
  //reason: 'deleted'
  //reason: 'missing'
//409 = confict