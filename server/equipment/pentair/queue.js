// // const { acknowledgment, preparePacketForSending } = require ('./helperFunctions');
// const { preparePacketForSending } = require (process.env.NODE_PATH + '/server/equipment/pentair/helperFunctions');
// const { port } = require(process.env.NODE_PATH + '/server/communications/serialPort');
// var { queueLoopMain_InUse, showPumpStatusInConsole, acknowledgment } = require(process.env.NODE_PATH + '/server/variables');
// var logger = require (process.env.NODE_PATH + '/server/logging/winston').sendToLogs;

// const PentairMessages = require(process.env.NODE_PATH + '/server/equipment/pentair/PentairMessages');

// var queueMessagesToSend = [];
// var queueLoopMain_InUse = false;

// ///////////////// main functions///////////////////////
// var queueLoopMain = module.exports.queueLoopMain = function (stopFunction = false) {
//   //main code loop,
//   //checks the queue, then sends the message on the queue
//   //eventually will incouperate timers

//   port.pause();
//   if (stopFunction !== false) {
//     console.log ('queueLoopMain-Stopped!');
//     return;
//   }

//   if ((queueMessagesToSend.length === 0 && acknowledgment.status === 'none') || queueLoopMain_InUse === true ) {
//     //if no message, then just skip funciton
//     //queueLoopMain_InUse: while i want tobe  async, i only want 1 running at a time
//   } else {
//     queueLoopMain_InUse = true;

//     if (acknowledgment.status === 'waiting For') {
//       if (!acknowledgment.startTimeWait) { acknowledgment.startTimeWait = new Date(); }

//       acknowledgment.nowTimeWait = new Date();
//       var deltaTime = acknowledgment.nowTimeWait.getTime() - acknowledgment.startTimeWait.getTime();
//       if (deltaTime >= 75) {
//         if (acknowledgment.missingMessageCount >= 3) {
//           acknowledgment.missingMessageCount = 0;
//           console.log ('Error: Acknowledgment Missing: ', acknowledgment.orginalMessage);
//           acknowledgment.reset();
//         } else {
//           acknowledgment.missingMessageCount++;
//           acknowledgment.status = 'none';
//           queueMessagesToSend.unshift(acknowledgment.orginalMessage);
//         }
//       } else {
//       }
//     } else if (acknowledgment.status === 'found') {
//       acknowledgment.reset();
//     }

//     if (acknowledgment.status === 'none' && queueMessagesToSend.length !== 0 ) {
//       // console.log('queueMessagesToSend.length: ' , queueMessagesToSend.length);
//       var specificMessageToSend = queueMessagesToSend.shift();
//       sendCommand(specificMessageToSend);
//       acknowledgment.status = 'waiting For';
//       acknowledgment.orginalMessage = specificMessageToSend;
//       // console.log('specificMessageToSend: ' , specificMessageToSend);
//       // console.log('queueMessagesToSend.length: ' , queueMessagesToSend.length);
//     }
//     queueLoopMain_InUse = false;

//   }
//   port.resume();
// };


// var addStatusToQueue = module.exports.addStatusToQueue = function () {
//   sendCommand(pumpToRemote);
//   sendCommand(pumpGetStatus);
//   sendCommand(pumpToLocal);
// };


// var addToQueue = module.exports.addToQueue = function (message) {
//   //add a pcket to the queue
//   //if queue is empty, adds packets to set pump to remote in beginning, and set pump to local at end of queue
//   //this way the pump should only be set to remote when sending information

//   if (queueMessagesToSend.length === 0) {
//     // queueMessagesToSend.push(pumpToRemote);   //i guess i don't really need SetToRemote
//     queueMessagesToSend.push(message);
//     queueMessagesToSend.push(PentairMessages.defaultPumpControlPanelMessage('local'));
//   } else {
//     queueMessagesToSend[queueMessagesToSend.length - 1] = message;
//     // ok i guess i do, it appears that while you can send commands without the SetToRemote, if you fail to have SetToLocal, the pump does not come out of remote  --or it might be an another annoying artiface from nodejs-PentairControlSystem
//   }
// };


// var sendCommand = module.exports.sendCommand = function (message, name = 'unknown') { //sendCommandViaArrayOfBytes
//   var packet, byteArray;
//   if (!message) { return logger('events', 'error', 'sendCommand: Message is undefined:' + message); }

//   if (typeof message === 'object' && Array.isArray(message) === false) {
//     byteArray = message.packet;
//     name = message.name;
//   } else if (Array.isArray(message) === true) {
//     byteArray = message;
//   } else { return logger('events', 'error', 'sendCommand: Message is invalid:' + message); }

//   // packet = Buffer.from(preparePacketForSending (byteArray)); //adds header, checksum and converts to a buffer

//   port.write(Buffer.from(byteArray), function(err) {
//     if (err) {
//       returnlogger('events', 'error', 'Error on write: ', err.message);
//     }
//     if ((showPumpStatusInConsole === false && message.name === 'Get Pump Status')
//     // || message === pumpToLocal
//     // || message === pumpToRemote
//     ) {
//     } else { //ignore logging of the status messages
//       // console.log('Sent Command: ' + name, ': [' + [...packet] + ']');
//       logger('events', 'verbose', 'Sent Command: ' + name, ': [' + [...message.packet] + ']');
//     }
//   });
// };