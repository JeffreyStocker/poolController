var SerialPort = require('serialport');
var http = require('http')
var url = require('url');
var fs = require('fs');
var events = require('events');
var io = require ("socket.io")
var os = require('os');  //to get os version so i can install some testings
// var 
// var pumpFunctions= require ('./pumpFunction.js')

var showPumpStatusInConsole=false;
var messagesReceived=[];
var queueMessagesToSend=[];
var queueLoopMain_InUse=false;

var acknowledgment = 
{
  // message:[],
  status:'none',

  orginalMessage:undefined,
  missingMessageCount: 0,
  
  startTimeWait: undefined,
  nowTimeWait: undefined,

  isAcknowledgment: function (messageToCheck){
    var originalByteArray= flipSourceAndDestinationFromStrippedMessage(this.orginalMessage.byte)
    // console.log("orginalMessage: " , originalByteArray.toString());
    // console.log("messageToCheck: " , messageToCheck);
    if (originalByteArray.toString() === messageToCheck.toString()){
      // console.log("IT IS TRUE!!!");
      return true
    }
    else {return false}
  },

  reset: function (){
    acknowledgment.status = 'none';
    acknowledgment.startTimeWait = 0;
    acknowledgment.nowTimeWait = 0;
    acknowledgment.orginalMessage = undefined;
    acknowledgment.missingMessageCount = 0;
  },
  resetTimers: function (){
    acknowledgment.startTimeWait = 0;
    acknowledgment.nowTimeWait = 0;

  },
  resetMessages: function (){
    acknowledgment.status = 'none';
    acknowledgment.orginalMessage = undefined;
    acknowledgment.missingMessageCount = 0;
  }

};
var exteralTimer;
var port;
var pumpData;
var statusRequestUpdateInverval = 500 ; //controls how often pump status are sent
var timeBetweenQueueSending = 250;  //intervel beteen when the queue sends off another message

/////// packet Information /////////////////////////
/* 
speed #, Higher # higher priority
soler 4
slow speed 3
waterfall speed 2
heater/spa speed 1
*/
var prefix= [255,0,255,165,0]
var shortPrefix = [255,0,255]
var pumpToRemote=         {packet: Buffer.from('a50060100401ff0219', 'hex'),      name:"Set Pump to Remote",  hex: 'a50060100401ff0219',       byte:[165, 0, 96, 16, 4, 1, 255, 2, 25 ]}  //intellicom set pump to remote  //works
var pumpToLocal=          {packet: Buffer.from('a5006010040100011a', 'hex'),      name:"Set Pump to Local",   hex: 'a5006010040100011a',       byte:[165, 0, 96, 16, 4, 1, 0, 1, 26 ]}
var pumpExternal_Speed4=  {packet: Buffer.from('a5006010010403210020015e','hex'), name:"Exteral Speed 4",     hex: 'a5006010010403210020015e', byte:[165, 0, 96, 16, 1, 4, 3, 33, 0, 32, 1, 94 ]} //intellicom use external command i think 4 (highest his is solar  priority) (possibley with 1 min timer?)
var pumpExternal_Speed3=  {packet: Buffer.from('a50060100104032100180156','hex'), name:"Exteral Speed 3",     hex: 'a50060100104032100180156', byte:[165, 0, 96, 16, 1, 4, 3, 33, 0, 24, 1, 86 ]} //slow Speed
var pumpExternal_Speed2=  {packet: Buffer.from('a5006010010403210010014e','hex'), name:"Exteral Speed 2",     hex: 'a5006010010403210010014e', byte:[165, 0, 96, 16, 1, 4, 3, 33, 0, 16, 1, 78 ]} //waterfall
var pumpExternal_Speed1=  {packet: Buffer.from('a50060100104032100080146','hex'), name:"Exteral Speed 1",     hex: 'a50060100104032100080146', byte:[165, 0, 96, 16, 1, 4, 3, 33, 0, 8, 1, 70 ]} //spa
var pump_Off=             {packet: Buffer.from('a5006010010403210000013e','hex'), name:"Speed OFF",           hex: 'a5006010010403210000013e', byte:[165, 0, 96, 16, 1, 4, 3, 33, 0, 0, 1, 62]}
var pumpGetStatus=        {packet: Buffer.from([165,0,96,16,7,0,1,28]),           name: "Get Pump Status",    hex: 'A50961670128',             byte:[165, 0, 96, 16, 7, 0, 1, 28]} //this works

//may not be working
var pump_PowerOn=         {packet: Buffer.from('A500601006010A0126','hex'),       name:"Set Power On",        hex: 'A500601006010A0126',       byte:[165, 0, 96, 16, 6, 1, 10], byteWithChecksum:[165, 0, 96, 16, 6, 1, 10, 1, 38]}
var pump_PowerOff=        {packet: Buffer.from('A50060100601040120','hex'),       name:"Set Power Off",       hex: 'A50060100601040120',       byte:[165, 0, 96, 16, 6, 1, 4], byteWithChecksum:[165, 0, 96, 16, 6, 1, 4, 1, 32]}


//////// server, serial Port Functions //////////////////////
if (os.platform()==="win32"){
  const SerialPort = require('serialport/test'); 
  const MockBinding = SerialPort.Binding;
  const portPath = 'COM_ANYTHING';
  MockBinding.createPort(portPath, { echo: false, record: false });
  port = new SerialPort(portPath);

  port.on('open', () => {
    // To pretend to receive data (only works on open ports)
    port.binding.emitData(Buffer.from('Hi from my test!'));
  });
  // log received data
  port.on('data', (data) => {
    console.log('Received:\t', data.toString('utf8'));
  });
  // port.write('message', () => {
  //   console.log('Write:\t\t Complete!');
  //   console.log('Last write:\t', port.binding.lastWrite.toString('utf8'));
  // });

} else {
  var SerialPort = require('serialport');
  var port = new SerialPort('/dev/ttyUSB0', function (err) {
    if (err) {
      return console.log('Error: ', err.message);
    }
    console.log ('Serial Port Created')
  });

  

  // Switches the port into "flowing mode"
  port.on('data', function (data) {
    data = convertToDecArray (data)
    if  (data[4] === 7) {
      pumpData = parsePumpStatus(data);
      if (showPumpStatusInConsole) { console.log('Data Received:  [' + [... data] + "]"); }
      // console.log ("Pump Data Updated")
      try{
      pushPumpInfoToWebPages();
      // socket.emit("pumpData", pumpData)
      }
      catch (err) {
        console.log ("Error: Port:On: pushPUmpInfoToWebPages is not working")
        console.log('Status Received:  [' + [... data] + "]");
      }
      acknowledgment.status='found'
    }

    else if (acknowledgment.status === 'waiting For') {
     var check =  acknowledgment.isAcknowledgment(data)
      console.log(check)
      acknowledgment.status='found'
      console.log('Acknowledged:  [' + [... data] + "]");
      // acknowledgment.message.push(data); 
      // acknowledgment.reset();
    }

    // else if (acknowledgment.status !== 'waiting For' || acknowledgment.isAcknowledgment(data) !== true) {
    //   console.log ('not acknowledgment', data)
    // }

    else if (Array.isArray(data) === false){
      console.log(data)
    }
    else {
      console.log('Data Received:  [' + [... data] + "]");
    }
  });
}


var server = http.createServer(function (req, res) {
  var urlPath = url.parse(req.url, true);

  //if the folder is blank, direct it to the index.html of that folder
  if (urlPath.pathname[urlPath.pathname.length-1] === "/") {urlPath.pathname+='index.html'}

  
  //directs the files to look in public/www for the html files rather than the base folder
  //use '.' urlPath.pathname to direct to the base folder
  // var mainDirectory= "./public/www/"
  var mainDirectory= "./"
  var filename = mainDirectory + urlPath.pathname; 

  fs.readFile(filename, function(err, data) {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'});
      return res.end("404 Not Found");
    } 
    // res.writeHead(200, {'Content-Type': 'text/html'}); //comment this out and it lets the web browser decide on type
    res.write(data);
    return res.end();
  });
}).listen(8181,function() {
    console.log('Listening at: http://localhost:8181');
}); 


///////////////// main functions///////////////////////
function queueLoopMain(stopFunction=false){ 
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
 //sends command from shift
  //need to figure out how to look for a specific sequence
  // packetToLookFor
  // var messagesRecieved=[]
  // var queueMessagesToSend=[]
  // port.resume()

  // console.log("queueMessagesToSend.length: " , queueMessagesToSend.length);
  // if (queueMessagesToSend.length===1) {setTimeout(function (){
  //   addStatusToQueue (pump)
  // }), 1000}






function addStatusToQueue (){
  sendCommand(pumpToRemote);
  sendCommand(pumpGetStatus);
  sendCommand(pumpToLocal);
}


function addToQueue (packet){
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


function sendCommand (message, name='unknown'){ //sendCommandViaArrayOfBytes
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


function runIntellicomPumpSpeed (speed=0, interval=10000){
  var externalVariable = {0: pump_Off, 1:pumpExternal_Speed1, 2:pumpExternal_Speed2 , 3:pumpExternal_Speed3,  4:pumpExternal_Speed4}
  addToQueue(externalVariable[speed])
  if (!speed===0) {
    exteralTimer = setInterval(function(){
      addToQueue(externalVariable[speed])
    }, interval)
  }
  // console.log("externalVariable[speed]: " , externalVariable[speed]);
}


var pushPumpInfoToWebPages
///////////////////IO SOCKETS////////////////////////

io.listen(server).on('connection', function (socket) {// WebSocket Connection

  pushPumpInfoToWebPages = function pushPumpInfoToWebPages (){
    socket.emit('pumpDataReturn', pumpData)
  }

  socket.on ('pumpDataForceUpdate', function (){
    console.log ("pump data requested and Pump Information")
    addToQueue (pumpGetStatus)
    socket.emit('pumpDataReturn', pumpData)
  })

  socket.on ('pumpData', function (){
    console.log ("pump data requested")
    socket.emit('pumpDataReturn', pumpData)
  })

  socket.on('pump off', function() {
    clearInterval(exteralTimer) //clear external timers
    // addToQueue(pumpToRemote)
    addToQueue(pump_Off)
    // addToQueue(pumpToLocal)
  });

  socket.on('intellicom', function (speed){
    runIntellicomPumpSpeed(speed);
  })

  socket.on ('test_runpumpSpeedAt1000RPM', function () {
    addToQueue ([ 165, 0, 96, 33, 1, 4, 2, 196, 3, 232 ])
  })

  socket.on('setPumpExternalspeed', function (speed){
    runIntellicomPumpSpeed(speed)
  })

  socket.on ("pumpPower", function (powerState){
    pumpPower(powerState)
  })

  socket.on ("runPumpAtSpeed", function (rpm){
    runPumpAtSpeed(rpm)
  })

  socket.on ("setPumpTimer", function (time){
    setPumpTimer(time)
  })

  socket.on ("manualPumpControl", function (time){
    manualPumpControl(time)
  })

  socket.on ("pumpControlPanelState", function (state){
    pumpControlPanelState(state)
  })
  
  


  




  socket.on ("toggleStatusUpdate", function (state){
    if (pumpGetStatus) {
      clearInterval (exteralTimer)
    }
    else {
      addToQueue(pumpGetStatus)
      exteralTimer = setInterval(()=> {
        addToQueue(pumpGetStatus)
      }, statusRequestUpdateInverval) //gets pump status once every mintute  statusRequestUpdateInverval
    }
  })
});


function pumpControlPanelState (powerState){
  if (powerState==="toggle"){
    clearInterval(exteralTimer)
    addToQueue(pumpToRemote)
    addToQueue(pumpToLocal)
  }
  else if (powerState==="remote"){
    addToQueue(pumpToRemote)
  }
  else if (powerState==="local"){
    clearInterval(exteralTimer)
    addToQueue(pumpToLocal)
  }
  else {
    return "Error: In order to change the pump Power state, you need to enter true/false or on/off"
  }
}


function pumpPower (powerState){
  if (powerState==="toggle"){
    clearInterval(exteralTimer)
    addToQueue(pump_PowerOff)
    addToQueue(pump_PowerOn)
  }
  else if (powerState==="on"){
    addToQueue(pump_PowerOn)
  }
  else if (powerState==="off"){
    clearInterval(exteralTimer)
    addToQueue(pump_PowerOff)
  }
  else {
    return "Error: In order to change the pump Power state, you need to enter true/false or on/off"
  }
}



///////////////buffer conversion helpers functions/////
function convertHexArrayToByteArray (hexarray, transformIntoArray=false){
  //https://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript
  //converts an array/buffer of hex into numeric
  //this is a lot easier to manipulate
  var output=hexarray.map(function(element){
    return parseInt(element, 16);
  }) 
  //if transform into a array, converts to a standard array via [...output]
  return transformIntoArray === false ? output : [...output]
}


function returnArrayFromBuffer(buffer){
  //https://stackoverflow.com/questions/18148827/convert-buffer-to-array
  return Array.prototype.slice.call(buffer, 0)
  //or [...exampleBuffer]
}

function hasHeader (message){
  var indexOfStart = message.indexOf(165)
  if (indexOfStart===-1) {
    console.log ('hasHeader: Error: Message does not have a 165 bit')
  }
  else if (indexOfStart === 0) {
    return false
  }
  else if (indexOfStart >= 1) {
    return true
  }
  else {
    console.log ('hasHeader: Error: 165 Bit location caused an Error')
  }
}


function stripMessageOfHeaderAndChecksum (message){
  //removes the HEADER and high and low bit checksum
  //converts either Buffer or array, and returns same
  if (Buffer.isBuffer(message) === false && Array.isArray (message)===true) {
    var messageArray = message
  }
  else if (Buffer.isBuffer(message) === true){
    var buffer = true;
    var messageArray = [...message]  //convert to a normal array
  }
  var StartOfMessege = messageArray.indexOf(165)
  if (StartOfMessege === -1) {
    console.log (message);
    return "Error No Start (165) byte the Message"
  }
  var strippedMessage = message.slice (StartOfMessege, message.length-2)  //removes the high and low checksum bytes in back and the HEADER
  
  return buffer === true ? Buffer.from (strippedMessage) : strippedMessage
}

/////////////////////// helper Functions  //////
function sumOfBytes (message){
  var sum = message.reduce((accumulator, element)=>{
    return accumulator + element
  },0)
  return sum
}

function returnHighBit (value){
  return parseInt(value / 256)
}

function returnLowBit (value){
  return value % 256
}

function combineHighPlusLowBit (highBit, lowBit){
  //returns the checksum, calculated from the high Bit and Low bit
  return highBit*256 + lowBit
}

function appendCheckSum (packet){
  //appends the 
  var checksum = sumOfBytes(packet)
  var highAndLowBitArray = [];

  highAndLowBitArray.push(returnHighBit(checksum))
  highAndLowBitArray.push(returnLowBit(checksum))
  return packet.concat(highAndLowBitArray)
}

function addOnHeaderToPacket (packet){
  return [255,0,255].concat(packet)
}

function preparePacketForSending (packet){
  //prepares a packet ie: [2,4,3,2] for sending by adding a header and checksum high & lowbit
  var clonePacket= packet;
  clonePacket = appendCheckSum (clonePacket);
  clonePacket = addOnHeaderToPacket (clonePacket)
  return clonePacket
}

function returnHighAndLowBitOfChecksum (message){
  //returns an array [highBit, lowBit] calculated by taking the sum of the message
  var checksum = sumOfBytes(message)
  var checksumLargeandSmallBit = [returnHighBit (checksum), returnLowBit (checksum)]
  return checksumLargeandSmallBit
}



function parsePumpStatus (data){
  if (hasHeader(data) === true){
    data = stripMessageOfHeaderAndChecksum (data)
  }


  //return an object with pump status
  //input a stripped array, NO BUFFER //may work with buffer, not tested
  //165,0,16,96,7,15,10,0,0,0,198,5,120,0,0,0,0,0,1,22,4
  var indexAdjust=0;
  var pumpData ={
    destination:  data[2],
    source:       data[3],
    action:       data[4],
    length:       data[5],
    state:         data[6], //4= off, 10 = on //power i think
    driveState:   data[7],
    ppc:          data[8],
    wattHighBit:  data[9], 
    wattLowBit:   data[10],
    rpmHighBit:   data[11],
    rpmLowBit:    data[12],
    timerHighBit: data[15],
    timerLowBit:  data[18],
    timeHours:    data[19],
    timeMin:      data[20]
  };
  pumpData.watt = combineHighPlusLowBit(pumpData.wattHighBit,pumpData.wattLowBit )
  pumpData.rpm = combineHighPlusLowBit(pumpData.rpmHighBit,pumpData.rpmLowBit )
  pumpData.timer = pumpData.timerHighBit + ':' + pumpData.timerLowBit;
  pumpData.timeCurrent = pumpData.timeHours + ":" + pumpData.timeMin;

  return pumpData
}


function flipSourceAndDestinationFromStrippedMessage(buffer){
  //flips the destinttion and source bits
  //
  if (Array.isArray(buffer) !== true){
    return Error ('flipSourceAndDestinationFromStrippedMessage: Input is not an Array')
  }
  //need to add prefix checking
  //assuming this is a stripped message
  // buffer=exampleOfStrippedMessage = [165,0,16,96,7,15,4,0,0,0,0,0,0,0,0,0,0,0,0,16,12]

  var output = buffer.slice(); //needed this or the orginal array was changed
  var temp = output[2];
  output[2] = output[3];
  output[3] =temp;

  return output
}


function convertToDecArray (bufferArray){
  var output  = [... bufferArray]
  // .map((element) => {
  //   return parseInt(element, 16);
  // }); 
  return stripMessageOfHeaderAndChecksum(output)
}


function runPumpAtSpeed(rpm){
  // var Examplepacket= [ 165, 0, 96, 33, 1, 4, 2, 196, 3, 232 ]
  var packet={}
  var destination = 96      //96 pump 1
  var source = 16           //16= controller of some sort
  var action = 1            //1= set speed mode, unsure if other modes
  var length = 4            //for speed, i don't think this changes from 4,
  var command = 2           //3= run program , 2= run/save? at speed????
  var subcommand = 196      //33 = run program xx / turn off pump, 39-42, save P1-4 as xx, 43 set pump timer for xx min || command =2; subcommand - 96 or 196 then might be linked to speed 1
  var commandHighBit = returnHighBit (rpm) //changes, either RPM high or timer HH or MM
  var commandLowBit = returnLowBit (rpm)  //changes either rpm low, or timer MM
  // var checksumHighBit = //checksum high added later in code
  // var checksumLowBit = //chechsum low added later in code
  // console.log("commandHighBit: " , commandHighBit);
  // console.log("returnLowBit (rpm): " , commandLowBit);
  packet['byte']= [165, 0, destination, source, action, length, command, subcommand, commandHighBit, commandLowBit]
  // console.log (packet.byte)
  packet.name= "Run Pump at " + rpm
  addToQueue (packet)
}


function setPumpTimer (min){
  // var Examplepacket= [ 165, 0, 96, 33, 1, 4, 2, 196, 3, 232 ]
  console.log("time: " , min);
  var packet={}
  var destination = 96      //96 pump 1
  var source = 16           //16= controller of some sort
  var action = 1            //1= set speed mode, unsure if other modes
  var length = 6            //for speed, i don't think this changes from 4,
  var command = 2           //3= run program , 2= run/save? at speed????
  var subcommand = 33     //33 = run program xx / turn off pump, 39-42, save P1-4 as xx, 43 set pump timer for xx min || command =2; subcommand - 96 or 196 then might be linked to speed 1
  var commandHighBit = 1//returnHighBit (time) //changes, either RPM high or timer HH or MM
  var commandLowBit = 50//returnLowBit (time)  //changes either rpm low, or timer MM
  // var checksumHighBit = //checksum high added later in code
  // var checksumLowBit = //chechsum low added later in code
  console.log("commandHighBit: " , commandHighBit);
  console.log("returnLowBit (rpm): " , commandLowBit);

  packet['byte']= [165, 0, destination, source, action, 3, command,commandHighBit, commandLowBit]
  // packet['byte']= [165, 0, destination, source, action, length, command, subcommand, 3,232,commandHighBit, commandLowBit]
  // packet['byte']= [165, 0, destination, source, action, length, command, subcommand, 3,232,commandHighBit, commandLowBit]
  packet['byte']=[ 165, 0, 96, 16, 1, 4, 3, 43, 1, 30 ]
  packet['byte']=[ 165, 0, 96, 16, 1, 2, 3, 43]
  packet['byte']=[ 165, 0, 96, 16, 1, 2, 3, 43]
  // console.log (packet.byte)

  // packet.name= "Run Pump at " + rpm

  addToQueue (packet)
}


function manualPumpControl (rpm, time=1, action= 1, command=3, subcommand = 33, destination = 96, source = 16) {
    // var Examplepacket= [ 165, 0, 96, 33, 1, 4, 2, 196, 3, 232 ]
    console.log("time: " , time);
    var packet={}
    var destination = 96      //96 pump 1
    var source = 16           //16= controller of some sort
    var action = 1            //1= set speed mode, unsure if other modes
    var length = 4            //for speed, i don't think this changes from 4,
    var command = 3          //3= run program , 2= run/save? at speed????
    var subcommand = 43      //33 = run program xx / turn off pump, 39-42, save P1-4 as xx, 43 set pump timer for xx min || command =2; subcommand - 96 or 196 then might be linked to speed 1
    var commandHighBit = returnHighBit (timer) //changes, either RPM high or timer HH or MM
    var commandLowBit = returnLowBit (timer)  //changes either rpm low, or timer MM

    var timerHighBit = 1;
    var timerLowBit = 10;
    // if ()

    // var checksumHighBit = //checksum high added later in code
    // var checksumLowBit = //chechsum low added later in code
    console.log("commandHighBit: " , commandHighBit);
    console.log("returnLowBit (rpm): " , commandLowBit);
  
    // packet['byte']= [165, 0, destination, source, action, 6, command, subcommand, 3,232,commandHighBit, commandLowBit]  //manual set to 1000 rpm
    // packet['byte']= [165, 0, destination, source, action, length, command, subcommand, commandHighBit, commandLowBit]
    packet['byte']= [165, 0, destination, source, action, 6, command, subcommand, commandHighBit, commandLowBit, timerHighBit, timerLowBit]
    // packet['byte']= [165, 0, destination, source, action, 2, command, subcommand, ]
  
    // console.log (packet.byte)
  
    packet.name= "Run Pump at " + rpm
  
    addToQueue (packet)
}




















//////////////////initial code to start the main sequence
(function init (){
  //start main program
  setInterval(queueLoopMain, timeBetweenQueueSending)
  //starts routine pump status updates
  addToQueue(pumpGetStatus)
  setInterval(()=> {
    addToQueue(pumpGetStatus)
  },statusRequestUpdateInverval) //gets pump status once every mintute
  })()
  

  // function exitSendCommand(){
//   // sendCommand(pumpToLocal)  //return pump to local command
//   port.write(pumpToLocal.packet, function(err) {
//     if (err) {
//       return console.log('Error on write: ', err.message);
//     }
//     console.log('Sent Command: ', pumpToLocal.name, ': ', pumpToLocal.packet);
//   });
//   console.log ("Pump Set to local")
// }


// process.on('SIGINT', function () { //on ctrl+c
//   // clearTimeout()  setTimeout (queueLoopMain, 100)


//   queueLoopMain(true)
//   exitSendCommand()  //exit sequence, should exit 

//   //https://stackoverflow.com/questions/21864127/nodejs-process-hangs-on-exit-ctrlc
//   console.log('Nice SIGINT-handler');
//   var listeners = process.listeners('SIGINT');
//   for (var i = 0; i < listeners.length; i++) {
//       console.log(listeners[i].toString());
//   }

//   process.exit(); //exit completely
// }); 
