const { acknowledgment } = require ('./helperFunctions');
const { port } = require('./../serialPort');
var { queueMessagesToSend, queueLoopMain_InUse } = require('../variables');
///////////////// main functions///////////////////////
var queueLoopMain = exports.queueLoopMain = function (stopFunction=false){
  //main code loop,
  //checks the queue, then sends the message on the queue
  //eventually will incouperate timers

  port.pause()
  if (stopFunction!==false){
    console.log ("queueLoopMain-Stopped!")
    return
  }

  if ((queueMessagesToSend.length===0 && acknowledgment.status === 'none') || queueLoopMain_InUse===true )
    { //if no message, then just skip funciton
      //queueLoopMain_InUse: while i want tobe  async, i only want 1 running at a time
    }
  else{
    queueLoopMain_InUse=true;

    if (acknowledgment.status==='waiting For') {
      // console.log(acknowledgment.status);
      if (!acknowledgment.startTimeWait) {acknowledgment.startTimeWait = new Date();}

      acknowledgment.nowTimeWait = new Date();
      var deltaTime = acknowledgment.nowTimeWait.getTime() - acknowledgment.startTimeWait.getTime()
      // console.log (acknowledgment.nowTimeWait.getTime(), "|", acknowledgment.startTimeWait.getTime() )
      if (deltaTime >= 75) {
        if (acknowledgment.missingMessageCount>=3) {
          acknowledgment.missingMessageCount=0
          console.log ("Error: Acknologment Missing: ", acknowledgment.orginalMessage)
          acknowledgment.reset();
        }
        else {
          acknowledgment.missingMessageCount++;
          acknowledgment.status = 'none';
          queueMessagesToSend.unshift(acknowledgment.orginalMessage)
        }
      }
      else {
       }
    }
    else if (acknowledgment.status==='found'){
      // console.log ("Message Found")
      acknowledgment.reset()
      }


    if (acknowledgment.status === 'none' && queueMessagesToSend.length !== 0 ) {
      // console.log("queueMessagesToSend.length: " , queueMessagesToSend.length);
      var specificMessageToSend=queueMessagesToSend.shift()
      sendCommand(specificMessageToSend)

      acknowledgment.status='waiting For';
      acknowledgment.orginalMessage = specificMessageToSend;


      // console.log("specificMessageToSend: " , specificMessageToSend);
      // console.log("queueMessagesToSend.length: " , queueMessagesToSend.length);

      }
    queueLoopMain_InUse=false;

  }
  port.resume()
}




var addStatusToQueue = exports.addStatusToQueue = function (){
  sendCommand(pumpToRemote);
  sendCommand(pumpGetStatus);
  sendCommand(pumpToLocal);
}


var addToQueue = exports.addToQueue = function (packet){
  //add a pcket to the queue
  //if queue is empty, adds packets to set pump to remote in beginning, and set pump to local at end of queue
  //this way the pump should only be set to remote when sending information

  if (queueMessagesToSend.length===0){
    // queueMessagesToSend.push(pumpToRemote);   //i guess i don't really need SetToLocal/SetToRemote
    queueMessagesToSend.push(packet);
    // queueMessagesToSend.push(pumpToLocal);   //i guess i don't really need SetToLocal/SetToRemote
  }
  else {
    queueMessagesToSend[queueMessagesToSend.length-1] = packet
    // queueMessagesToSend.push(pumpToLocal);   //i guess i don't really need SetToLocal/SetToRemote
    // ok i guess i do, it appears that while you can send commands without the SetToRemote, if you fail to have SetToLocal, the pump does not come out of remote  --or it might be an another annoying artiface from nodejs-PentairControlSystem
  }
}


var sendCommand = exports.sendCommand = function (message, name='unknown'){ //sendCommandViaArrayOfBytes
  var packet;
  var byteArray;
  if (message===undefined) {return}

  if (typeof message === 'object' && Array.isArray(message)===false){
    byteArray = message.byte;
    name = message.name;
  }
  else if (Array.isArray(message)===true) {
    byteArray = message
  }
  else {return console.log ("Error: sendCommand: Message is invalid")}
  packet = Buffer.from(preparePacketForSending (byteArray)) //adds header, checksum and converts to a buffer

  port.write(packet, function(err) {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
    if ((showPumpStatusInConsole === false && name === pumpGetStatus.name)
      // || message === pumpToLocal
      // || message === pumpToRemote
    ){}  //ignore logging of the status messages
    else {
      console.log('Sent Command: ' + name, ': [' + [...packet] + ']');
    }
  });
}