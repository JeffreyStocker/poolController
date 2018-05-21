var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));
const TimeTracker = require (__dirname + '/../../server/TimeTracker.js');

const db = new PouchDB(__dirname + '/../../database/power');

var timer = new TimeTracker('begin');

var infoStart;

db.info()
  .then(results => {
    infoStart = results.doc_count;
  });

db.allDocs({include_docs: true})
  .then((docs) => {
    // docs.rows.
    var newDocs = [];
    docs.rows.forEach(({doc}) => {
      doc.equipment = 'Pump1';
      newDocs.push(doc);
    });
    console.log(newDocs);
    return db.bulkDocs(newDocs);
  })
  .then(() => {
    console.log('success');
  })
  .catch (err => {
    console.log('err', err);
  })
  .then(() =>{
    timer.end('end');
    db.info()
      .then(results => {
        console.log('count difference', infoStart - results.doc_count);
      });
  });



// db.allDocs({include_docs: true})
//   .then((docs) => {
//     // docs.rows.
//     var newDocs = [];
//     // docs.rows.forEach(doc => {
//     //   doc.equipment = 'Pump1';
//     //   newDocs.push(doc);
//     // });
//     console.log('all docs length', docs.rows.length);
//     // return db.bulkDocs(newDocs);
//   });

// db.find({
//   selector: {equipment: 'Pump1'}
// })
//   .then(results => {
//     console.log('find length', results.docs.length);
//     db.info()
//       .then(results => {
//         console.log('count', results.doc_count);
//         db.compact().then(function (result) {
//           // handle result
//         }).catch(function (err) {
//           console.log(err);
//         });
//       });
//   });


