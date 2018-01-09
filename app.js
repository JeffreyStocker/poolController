var { addToQueue } = require ('./server/server');


//start main program
setInterval(queueLoopMain, timeBetweenQueueSending)
//starts routine pump status updates
addToQueue(pumpGetStatus)
setInterval(()=> {
  addToQueue(pumpGetStatus)
},statusRequestUpdateInverval) //gets pump status once every mintute
