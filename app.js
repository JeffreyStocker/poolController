var { statusRequestUpdateInverval,  } = require ('./server/variables');
var { timeBetweenQueueSending} = require ('./server/server');
var { pumpGetStatus } = require ('./server/messages');
var { queueLoopMain, addToQueue } = require ('./server/pump/queue');


//start main program
setInterval(queueLoopMain, timeBetweenQueueSending)
//starts routine pump status updates
addToQueue(pumpGetStatus)
setInterval(()=> {
  addToQueue(pumpGetStatus)
},statusRequestUpdateInverval) //gets pump status once every mintute