//status
//400 - bad request
//404 - missing
//  reason: 'deleted'
//  reason: 'missing'
//409 = confict

var pouch = require('pouchdb');

var db = new pouch (__dirname + '/test');
var context;

db.put({_id: 'test'})
  .then((results) => {
    return db.remove({_id: results.id, _rev: results.rev});
  })
  .catch(err => {
    console.log('wtf Error:', err);
  })
  .then ((results) => {
    context = results;
    console.log('results 555:', results);
    return db.get('test', {revs: true})
      .then(results => {
        console.log('results 12:', results);
      })
      .catch (err => {
        console.log('get results zz', err);
        return db.get('test', {revs: true});
      })
      .then (results => {
        console.log('end resultsxxx:', results);
      })
      .catch( err => {
        console.log('err 55', err);
      });
    // return db.put({_id: 'test', _rev: results.rev});
  })
  // .catch(err => {
  //   console.log('1st Error', err);
  //   if (err.status === 404 && err.reason === 'deleted') {
  //     console.log('error 404');
  //     return db.get(context.id, {revs: true});
  //   }
  // })
  .then((results = 'nothing') => {
    console.log('end reslts:', results);
  })
  .catch(err => {
    console.log('finalError:', err);
  })
  .then(() => {
    db.destroy();
  });