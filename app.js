process.env.NODE_PATH = __dirname;

process.argv.forEach((val, index) => {
  let split = val.split('=');
  if (split.length > 1) {
    process.env[split[0]] = split[1];
    console.log(split[0] + ':', split[1]);
  }
});

// var Promise = require('bluebird');
const glob = require(process.env.NODE_PATH + '/requireGlob').init(['node_modules', 'spec', 'testingRandomStuff', 'public', 'logs']);
const configureFile = require(process.env.NODE_PATH + '/server/configureFile').init('./config.json');
// const configureFile = require(process.env.NODE_PATH + '/server/configureFile').init('default');
const logger = require(process.env.NODE_PATH + '/server/logging/winston.js').init(configureFile.config.system.logs);
configureFile.initLogging(logger);
process.env.PORT = configureFile.config.system.web.port || 8181;
const logStatus = requireGlob ('pentairPumpStatusLog.js');
const groupOfQueues = require (process.env.NODE_PATH + '/server/equipment/pentair/GroupOfQueues');
var socketServer = require (process.env.NODE_PATH + '/server/server');
const PentairQueue = requireGlob('PentairQueue');
const SerialPort = requireGlob('serialPort');
var incomingSockets = require (process.env.NODE_PATH + '/server/communications/incomingSocketIO');
var currentLogs = require (process.env.NODE_PATH + '/server/logging/CurrentLogs.js');


SerialPort.initPromise(configureFile.config.system.communications, logger)
  .then(serialPorts => {
    return serialPorts;
  })
  .catch(err => {
    logger('system', 'warn', err);
  })
  .then((serialPorts) => {
    var avaliableQueueTypes = {
      pentair: PentairQueue
    };
    groupOfQueues.setLogger(logger);
    for (let queueInfo of configureFile.config.equipment.pumps) {
      try {
        if (queueInfo.enabled && avaliableQueueTypes[queueInfo.communications.protocol]) {
          let queue = new avaliableQueueTypes[queueInfo.communications.protocol] (queueInfo.name, {
            hardwareAddress: queueInfo.communications.hardwareAddress,
            // address: queueInfo.communications.address,
            serialPort: SerialPort.returnPortByName(queueInfo.communications.hardwareAddress)
          });
          groupOfQueues.addQueue(queue, queueInfo.name, queueInfo.communications.hardwareAddress);
          // SerialPort.serialPortEvents.on(queueInfo.communications.hardwareAddress, (dataFromSerialPort) => {
          //   queue.processData(dataFromSerialPort);
          // });
        }
      } catch (err) {
        logger('system', 'error', 'Could not create a new queue with this name: ' + name);
      }
    }
    logStatus.init('./database/powerOld', 5 );

    return currentLogs.start();
  })
  .then(() => {
    // console.log (process.env)
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'debug' ) {
      requireGlob('pentairPumpCommands.js').runRepeatingStatus('on', 'Pump1', 1000, (err) => {
        if (err) {
          console.log ('err with repeating status', err);
        }
      });
    }

    // var moment = require('moment');
    // var start = moment().subtract(1, 'days').startOf('week').toDate();
    // logStatus.findBetweenTime(new Date(), start )
    //   .then(logStatus.sumAndAverageOfPowerLogs)
    //   .then(sumPower => console.log (sumPower))
    //   .catch(err => console.log(err));

    // logStatus.count()
    //   .then(sumPower => console.log (sumPower))
    //   .catch(err => console.log(err));

    // logStatus.allDocs()
    //  .then(sumPower => console.log ('all docs', sumPower))
    //  .then(sumPower => console.log ('all docs', sumPower.rows.map(rec => rec.doc)))
    //  .catch(err => console.log(err));
  })
  .catch(err => {
    logger('system', 'error', err);
    // console.log ('test', err);
    process.exit();
  });




////// these i will probably not use but they could come in handy for exiting /////////


// process.stdin.resume();//so the program will not close instantly

// var exitHandler = function(options, err) {
//   if (options.cleanup) { console.log('clean'); }
//   if (err) { console.log(err.stack); }
//   let packet = Buffer.from([165, 0, 96, 16, 4, 1, 0, 1, 26, 1, 53]); //adds header, checksum and converts to a buffer
//   var { port } = require (process.env.NODE_PATH + '/server/serialPort');
//   port.write(packet, function(err) {
//     if (err) {
//       console.log('Error on write: ', err.message + '/n' + err.stack);
//     }
//     if (options.exit) { console.log ('exiting'); process.exit(); }
//   });
// };

var exitHandler = function(options, err) {
  console.log ('Starting Exit');
  if (options.cleanup) { console.log('clean'); }
  if (err) { console.log(err.stack); }
  // let packet = Buffer.from([165, 0, 96, 16, 4, 1, 0, 1, 26, 1, 53]); //adds header, checksum and converts to a buffer
  // var { port } = require (process.env.NODE_PATH + '/server/serialPort');
  // require (__dirname + '/server/logging/CurrentLogs.js').exit()
  //   .then(results => {})
  //   .catch(err => {
  //     console.log('Error on write: ', err.message + '/n' + err.stack);
  //   })
  //   .then(() => {
  //     port.write(packet, function(err) {

  //       if (err) {
  //         console.log('Error on write: ', err.message + '/n' + err.stack);
  //       }
  //       if (options.exit) {
  //         console.log ('exiting');
  //       }
  //     });
  //   });
  currentLogs.exit()
    .catch(err => {
      console.log('error exiting', err);
    })
    .then(() => {
      console.log ('Exit Complete');
      process.exit();
    });
};

// //do something when app is closing
process.on('exit', exitHandler.bind(null, {cleanup: true}));

// //catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit: true}));

// // catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit: true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit: true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit: true}));