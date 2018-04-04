process.env.NODE_PATH = __dirname;

// var Promise = require('bluebird');
var glob = require(process.env.NODE_PATH + '/requireGlob').init(['node_modules', 'spec', 'testingRandomStuff', 'public', 'logs']);
var configureFile = require(process.env.NODE_PATH + '/server/configureFile').init('default');
var logger = require(process.env.NODE_PATH + '/server/logging/winston.js').init(configureFile.config.system.logs);
configureFile.initLogging('system', logger);

var useModular = true;

if (useModular) {
  // var serialPaths = configureFile.config.system.communications && configureFile.config.system.communications.rs485.ports;
  // require(process.env.NODE_PATH + '/server/serialPort_modular.js').init(serialPaths);
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
    })
    .then(() => {
      requireGlob('pentairPumpCommands.js').runRepeatingStatus();
    });

} else {
  // var config = require('./server/configureFile').init('./config.json');

  // var { statusRequestUpdateInverval, statusTimers } = require (process.env.NODE_PATH + '/server/variables');
  // // var { timeBetweenQueueSending } = require (process.env.NODE_PATH + '/server/server');
  // var {defaultStatusMessage} = require (process.env.NODE_PATH + '/server/equipment/pentair/PentairMessages.js');
  // var { queueLoopMain, addToQueue } = require (process.env.NODE_PATH + '/server/equipment/pentair/queue');
  // var incomingSockets = require (process.env.NODE_PATH + '/server/communications/incomingSocketIO');


  // var timeBetweenQueueSending = 250; //intervel beteen when the queue sends off another message



  ////start main program

  // setInterval(queueLoopMain, configureFile.config.system.queue.timeBetweenQueueSending, configureFile.config.system.communications);
  // ////starts routine pump status updates
  // addToQueue(defaultStatusMessage());


  // statusTimers = setInterval( ()=> {
  //   addToQueue(defaultStatusMessage());
  //   // console.log (pumpToLocal);
  //   // addToQueue(pumpToLocal);
  // }, statusRequestUpdateInverval); //gets pump status once every mintute
}



// process.on('uncaughtException', function(err) {
//   console.log('Caught exception: ' + err);
// });



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