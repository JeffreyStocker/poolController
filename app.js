process.env.NODE_PATH = __dirname;

// var config = require('./server/configureFile').init('./config.json');
var config = require('./server/configureFile').init('default');
var logger = require('./server/logs/winston.js').setupLogging(config.system.logs);


var { statusRequestUpdateInverval } = require ('./server/variables');
var { timeBetweenQueueSending } = require ('./server/server');
var { pumpGetStatus } = require ('./server/messages');
var { queueLoopMain, addToQueue } = require ('./server/pump/queue');
var incommingSockets = require ('./server/communications/incomingSocketIO');
var timeBetweenQueueSending = 250; //intervel beteen when the queue sends off another message

//start main program
setInterval(queueLoopMain, timeBetweenQueueSending);
//starts routine pump status updates
addToQueue(pumpGetStatus);


setInterval( ()=> {
  addToQueue(pumpGetStatus);
}, statusRequestUpdateInverval); //gets pump status once every mintute

// console.log ('path NODE_PATH:', process.env.NODE_PATH)
// console.log ('path __dir', __dirname)