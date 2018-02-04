process.env.NODE_PATH = __dirname;

// var config = require('./server/configureFile').init('./config.json');
var configureFile = require(process.env.NODE_PATH + '/server/configureFile').init('default');
var logger = require(process.env.NODE_PATH + '/server/logs/winston.js').init(configureFile.config.system.logs);
configureFile.initLogging('system', logger)

var { statusRequestUpdateInverval } = require (process.env.NODE_PATH + '/server/variables');
// var { timeBetweenQueueSending } = require (process.env.NODE_PATH + '/server/server');
var { pumpGetStatus } = require (process.env.NODE_PATH + '/server/messages');
var { queueLoopMain, addToQueue } = require (process.env.NODE_PATH + '/server/pump/queue');
var incomingSockets = require (process.env.NODE_PATH + '/server/communications/incomingSocketIO');


var timeBetweenQueueSending = 250; //intervel beteen when the queue sends off another message

//start main program
setInterval(queueLoopMain, configureFile.config.system.queue.timeBetweenQueueSending);
//starts routine pump status updates
addToQueue(pumpGetStatus);


setInterval( ()=> {
  addToQueue(pumpGetStatus);
}, statusRequestUpdateInverval); //gets pump status once every mintute



// process.on('uncaughtException', function(err) {
//   console.log('Caught exception: ' + err);
// });