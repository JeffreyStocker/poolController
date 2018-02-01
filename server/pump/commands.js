var msg = require (__dirname + '/../messages');
var { queueLoopMain, addToQueue } = require (__dirname + '/queue');
var { exteralTimer } = require ('../variables');


var runIntellicomPumpSpeed = exports.runIntellicomPumpSpeed = function (speed = 0, interval = 10000) {
  var externalVariable = {
    0: msg.pump_Off,
    1: msg.pumpExternal_Speed1,
    2: msg.pumpExternal_Speed2,
    3: msg.pumpExternal_Speed3,
    4: msg.pumpExternal_Speed4
  };
  addToQueue(externalVariable[speed]);
  if (!speed === 0) {
    exteralTimer = setInterval( function() {
      addToQueue(externalVariable[speed]);
    }, interval);
  }
  // console.log('externalVariable[speed]: ' , externalVariable[speed]);
};


var pumpControlPanelState = exports.pumpControlPanelState = function (powerState) {
  if (powerState === 'toggle') {
    clearInterval(exteralTimer);
    addToQueue(msg.pumpToRemote);
    addToQueue(msg.pumpToLocal);
  } else if (powerState === 'remote') {
    addToQueue(msg.pumpToRemote);
  } else if (powerState === 'local') {
    clearInterval(exteralTimer);
    addToQueue(msg.pumpToLocal);
  } else {
    return 'Error: In order to change the pump Power state, you need to enter true/false or on/off';
  }
};


var pumpPower = exports.pumpPower = function (powerState) {
  if (powerState === 'toggle') {
    clearInterval(exteralTimer);
    addToQueue(msg.pump_PowerOff);
    addToQueue(msg.pump_PowerOn);
  } else if (powerState === 'on') {
    addToQueue(msg.pump_PowerOn);
  } else if (powerState === 'off') {
    clearInterval(exteralTimer);
    addToQueue(msg.pump_PowerOff);
  } else {
    return 'Error: In order to change the pump Power state, you need to enter true/false or on/off';
  }
};


var runPumpAtSpeed = exports.runPumpAtSpeed = function(rpm) {
  // var Examplepacket= [ 165, 0, 96, 33, 1, 4, 2, 196, 3, 232 ]
  var packet = {};
  var destination = 96;      //96 pump 1
  var source = 16;           //16= controller of some sort
  var action = 1;           //1= set speed mode, unsure if other modes
  var length = 4;            //for speed, i don't think this changes from 4,
  var command = 2;           //3= run program , 2= run/save? at speed????
  var subcommand = 196;      //33 = run program xx / turn off pump, 39-42, save P1-4 as xx, 43 set pump timer for xx min || command =2; subcommand - 96 or 196 then might be linked to speed 1
  var commandHighBit = returnHighBit (rpm); //changes, either RPM high or timer HH or MM
  var commandLowBit = returnLowBit (rpm); //changes either rpm low, or timer MM
  // var checksumHighBit = //checksum high added later in code
  // var checksumLowBit = //chechsum low added later in code
  // console.log('commandHighBit: ' , commandHighBit);
  // console.log('returnLowBit (rpm): ' , commandLowBit);
  packet['byte'] = [165, 0, destination, source, action, length, command, subcommand, commandHighBit, commandLowBit];
  // console.log (packet.byte)
  packet.name = 'Run Pump at ' + rpm;
  addToQueue (packet);
};

var setPumpTimer = exports.setPumpTimer = function (min) {
  // var Examplepacket= [ 165, 0, 96, 33, 1, 4, 2, 196, 3, 232 ]
  console.log('time: ', min);
  var packet = {};
  var destination = 96;      //96 pump 1
  var source = 16;           //16= controller of some sort
  var action = 1;            //1= set speed mode, unsure if other modes
  var length = 6;            //for speed, i don't think this changes from 4,
  var command = 2;           //3= run program , 2= run/save? at speed????
  var subcommand = 33;     //33 = run program xx / turn off pump, 39-42, save P1-4 as xx, 43 set pump timer for xx min || command =2; subcommand - 96 or 196 then might be linked to speed 1
  var commandHighBit = 1; //returnHighBit (time) //changes, either RPM high or timer HH or MM
  var commandLowBit = 50; //returnLowBit (time)  //changes either rpm low, or timer MM
  // var checksumHighBit = //checksum high added later in code
  // var checksumLowBit = //chechsum low added later in code
  console.log('commandHighBit: ', commandHighBit);
  console.log('returnLowBit (rpm): ', commandLowBit);

  packet['byte'] = [165, 0, destination, source, action, 3, command, commandHighBit, commandLowBit];
  // packet['byte']= [165, 0, destination, source, action, length, command, subcommand, 3,232,commandHighBit, commandLowBit]
  // packet['byte']= [165, 0, destination, source, action, length, command, subcommand, 3,232,commandHighBit, commandLowBit]
  packet['byte'] = [ 165, 0, 96, 16, 1, 4, 3, 43, 1, 30 ];
  packet['byte'] = [ 165, 0, 96, 16, 1, 2, 3, 43];
  packet['byte'] = [ 165, 0, 96, 16, 1, 2, 3, 43];
  // console.log (packet.byte)

  // packet.name= 'Run Pump at ' + rpm

  addToQueue (packet);
};



var manualPumpControl = exports.manualPumpControl = function (rpm, time = 1, action = 1, command = 3, subcommand = 33, destination = 96, source = 16) {
  // var Examplepacket= [ 165, 0, 96, 33, 1, 4, 2, 196, 3, 232 ]
  console.log('time: ', time);
  var packet = {};
  var destination = 96;      //96 pump 1
  var source = 16;           //16= controller of some sort
  var action = 1;            //1= set speed mode, unsure if other modes
  var length = 4;            //for speed, i don't think this changes from 4,
  var command = 3;          //3= run program , 2= run/save? at speed????
  var subcommand = 43;      //33 = run program xx / turn off pump, 39-42, save P1-4 as xx, 43 set pump timer for xx min || command =2; subcommand - 96 or 196 then might be linked to speed 1
  var commandHighBit = returnHighBit (timer); //changes, either RPM high or timer HH or MM
  var commandLowBit = returnLowBit (timer); //changes either rpm low, or timer MM

  var timerHighBit = 1;
  var timerLowBit = 10;
  // if ()

  // var checksumHighBit = //checksum high added later in code
  // var checksumLowBit = //chechsum low added later in code
  console.log('commandHighBit: ', commandHighBit);
  console.log('returnLowBit (rpm): ', commandLowBit);

  // packet['byte']= [165, 0, destination, source, action, 6, command, subcommand, 3,232,commandHighBit, commandLowBit]  //manual set to 1000 rpm
  // packet['byte']= [165, 0, destination, source, action, length, command, subcommand, commandHighBit, commandLowBit]
  packet['byte'] = [165, 0, destination, source, action, 6, command, subcommand, commandHighBit, commandLowBit, timerHighBit, timerLowBit];
  // packet['byte']= [165, 0, destination, source, action, 2, command, subcommand, ]

  // console.log (packet.byte)

  packet.name = 'Run Pump at ' + rpm;

  addToQueue (packet);
};
