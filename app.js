process.env.NODE_PATH = __dirname;

process.argv.forEach((val, index) => {
  let split = val.split('=');
  if (split.length > 1) {
    process.env[split[0]] = split[1];
    console.log(split[0], ':', split[1]);
  }
});

// var Promise = require('bluebird');
var glob = require(process.env.NODE_PATH + '/requireGlob').init(['node_modules', 'spec', 'testingRandomStuff', 'public', 'logs']);
var configureFile = require(process.env.NODE_PATH + '/server/configureFile').init('default');
var logger = require(process.env.NODE_PATH + '/server/logging/winston.js').init(configureFile.config.system.logs);
configureFile.initLogging('system', logger);
var logStatus = requireGlob ('pentairPumpStatusLog.js');

require(process.env.NODE_PATH + '/server/communications/serialPortInit.js').init()
  .then(serialPorts => {
    return serialPorts;
  })
  .catch(serialPorts => {
    return serialPorts;
  })
  .then((serialPorts) => {
    var incomingSockets = require (process.env.NODE_PATH + '/server/communications/incomingSocketIO');
    var groupOfQueues = require (process.env.NODE_PATH + '/server/equipment/pentair/GroupOfQueues').init(
      configureFile.config.system.communications,
      serialPorts,
      logger
    );
    groupOfQueues.associateEquipment(configureFile.config.equipment.pumps);
    logStatus.init('./database/power', 5 );
  })
  .then(() => {
    // console.log (process.env)
    if (process.env.NODE_ENV === 'production') {
      requireGlob('pentairPumpCommands.js').runRepeatingStatus();
    }

    // var moment = require('moment');
    // var start = moment().subtract(1, 'days').startOf('week').toDate();
    // logStatus.findBetweenTime(new Date(), start )
    //   .then(logStatus.sumAndAverageOfPowerLogs)
    //   .then(sumPower => console.log (sumPower))
    //   .catch(err => console.log(err));
  })
  .catch(err => {
    console.log (err);
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

// // //do something when app is closing
// process.on('exit', exitHandler.bind(null, {cleanup: true}));

// // //catches ctrl+c event
// process.on('SIGINT', exitHandler.bind(null, {exit: true}));

// // // catches "kill pid" (for example: nodemon restart)
// process.on('SIGUSR1', exitHandler.bind(null, {exit: true}));
// process.on('SIGUSR2', exitHandler.bind(null, {exit: true}));

// //catches uncaught exceptions
// process.on('uncaughtException', exitHandler.bind(null, {exit: true}));