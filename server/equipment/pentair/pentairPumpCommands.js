var preBuiltMsg = require (process.env.NODE_PATH + '/server/preBuiltMessages');
var { queueLoopMain, addToQueue } = require (process.env.NODE_PATH + '/server/pump/queue');
var { exteralTimer, timerIntellicom } = require (process.env.NODE_PATH + '/server/variables');
var Message = require (process.env.NODE_PATH + '/server/Classes/Message.js');
var logger = require (process.env.NODE_PATH + '/server/logging/winston').sendToLogs;

module.exports = {
  runIntellicomPumpSpeed (speed = 0, interval = 10000) {
    if (speed === 0) {
      addToQueue(externalVariable['pumpExternal_Off']);
      clearInterval(timerIntellicom);
      logger('events', 'info', 'Running Intellicom External Pump Speed: Stop');
    } else if (speed > 0 && speed < 5) {
      addToQueue(externalVariable['pumpExternal_Speed' + speed]);
      logger('events', 'info', 'Running Intellicom External Pump Speed: ' + speed);

      timerIntellicom = setInterval( function() {
        addToQueue(externalVariable[speed]);
        logger('events', 'verbose', 'Running Intellicom in interval with External Pump Speed: ' + speed);
      }, interval);
    }
  },


  pumpControlPanelState (powerState) {
    if (powerState === 'toggle') {
      clearInterval(exteralTimer);
      addToQueue(preBuiltMsg.pumpToRemote);
      addToQueue(preBuiltMsg.pumpToLocal);
    } else if (powerState === 'remote') {
      addToQueue(preBuiltMsg.pumpToRemote);
    } else if (powerState === 'local') {
      clearInterval(exteralTimer);
      addToQueue(preBuiltMsg.pumpToLocal);
    } else {
      return 'Error: In order to change the pump Power state, you need to enter true/false or on/off';
    }
  },


  pumpPower (powerState) {
    if (powerState === 'toggle') {
      clearInterval(exteralTimer);
      addToQueue(preBuiltMsg.pump_PowerOff);
      addToQueue(preBuiltMsg.pump_PowerOn);
    } else if (powerState === 'on') {
      addToQueue(preBuiltMsg.pump_PowerOn);
    } else if (powerState === 'off') {
      clearInterval(exteralTimer);
      addToQueue(preBuiltMsg.pump_PowerOff);
    } else {
      return 'Error: In order to change the pump Power state, you need to enter true/false or on/off';
    }
  },


  runPumpAtSpeed (rpm) {
    // var Examplepacket= [ 165, 0, 96, 33, 1, 4, 2, 196, 3, 232 ]
    var message = {};
    var destination = 96; //96 pump 1
    var source = 16; //16= controller of some sort
    var action = 1; //1= set speed mode, unsure if other modes
    var length = 4; //for speed, i don't think this changes from 4,
    var command = 2; //3= run program , 2= run/save? at speed????
    var subcommand = 196; //33 = run program xx / turn off pump, 39-42, save P1-4 as xx, 43 set pump timer for xx min || command =2; subcommand - 96 or 196 then might be linked to speed 1
    var commandHighBit = returnHighBit (rpm); //changes, either RPM high or timer HH or MM
    var commandLowBit = returnLowBit (rpm); //changes either rpm low, or timer MM
    // var checksumHighBit = //checksum high added later in code
    // var checksumLowBit = //chechsum low added later in code
    // console.log('commandHighBit: ' , commandHighBit);
    // console.log('returnLowBit (rpm): ' , commandLowBit);
    message.packet = [165, 0, destination, source, action, length, command, subcommand, commandHighBit, commandLowBit];
    // console.log (packet.byte)
    message.name = 'Run Pump at ' + rpm;
    addToQueue (message);
  },

  runPumpProgram (speed, destination = 96, source = 16, callback) {
    if (speed === 0) {
      pumpPower('toogle');
      callback (null);
    } else if (speed >= 1 || speed <= 4) {
      addToQueue(preBuiltMsg.returnDefaultMessageByte('pumpSpeed' + speed, destination, source));
      callback (null);
    } else {
      callback ('Speed outside Correct Range (0-4)');
    }
  },

  setPumpSpeed (rpm, program, destination = 96, source = 16) {
    var message = {};
    var action = 1; //1= set speed mode, unsure if other modes
    var length = 4; //for speed, i don't think this changes from 4,
    var command = 33; //3= run program , 2= run/save? at speed????
    var subcommand;
    switch (program) {
    case 0:
      subcommand = 33;
    case 1:
      subcommand = 39;
      break;
    case 2:
      subcommand = 40;
      break;
    case 3:
      subcommand = 41;
      break;
    case 4:
      subcommand = 42;
      break;

    } //33 = run program xx / turn off pump, 39-42, save P1-4 as xx, 43 set pump timer for xx min || command =2; subcommand - 96 or 196 then might be linked to speed 1
    var commandHighBit = returnHighBit (rpm); //changes, either RPM high or timer HH or MM
    var commandLowBit = returnLowBit (rpm); //changes either rpm low, or timer MM
    // var checksumHighBit = //checksum high added later in code
    // var checksumLowBit = //chechsum low added later in code
    // console.log('commandHighBit: ' , commandHighBit);
    // console.log('returnLowBit (rpm): ' , commandLowBit);
    message.packet = [165, 0, destination, source, action, length, command, subcommand, commandHighBit, commandLowBit];
    // console.log (packet.byte)
    message.name = 'Run Pump Program: ' + program + ' at ' + rpm;
    addToQueue (packet);
  },

  //wip
  setPumpTimer (min) {
    // var Examplepacket= [ 165, 0, 96, 33, 1, 4, 2, 196, 3, 232 ]
    console.log('time: ', min);
    var message = {};
    var destination = 96; //96 pump 1
    var source = 16; //16= controller of some sort
    var action = 1; //1= set speed mode, unsure if other modes
    var length = 6; //for speed, i don't think this changes from 4,
    var command = 2; //3= run program , 2= run/save? at speed????
    var subcommand = 33; //33 = run program xx / turn off pump, 39-42, save P1-4 as xx, 43 set pump timer for xx min || command =2; subcommand - 96 or 196 then might be linked to speed 1
    var commandHighBit = 1; //returnHighBit (time) //changes, either RPM high or timer HH or MM
    var commandLowBit = 50; //returnLowBit (time)  //changes either rpm low, or timer MM
    // var checksumHighBit = //checksum high added later in code
    // var checksumLowBit = //chechsum low added later in code
    console.log('commandHighBit: ', commandHighBit);
    console.log('returnLowBit (rpm): ', commandLowBit);

    message.packet = [165, 0, destination, source, action, 3, command, commandHighBit, commandLowBit];
    // packet['byte']= [165, 0, destination, source, action, length, command, subcommand, 3,232,commandHighBit, commandLowBit]
    // packet['byte']= [165, 0, destination, source, action, length, command, subcommand, 3,232,commandHighBit, commandLowBit]
    message.packet = [ 165, 0, 96, 16, 1, 4, 3, 43, 1, 30 ];
    message.packet = [ 165, 0, 96, 16, 1, 2, 3, 43];
    message.packet = [ 165, 0, 96, 16, 1, 2, 3, 43];
    message.name = 'Run Pump With Timer of ' + min;
    // console.log (packet.byte)

    // packet.name= 'Run Pump at ' + rpm
    addToQueue (message);
  },


  manualPumpControl (rpm, time = 1, action = 1, command = 3, subcommand = 33, destination = 96, source = 16) {
    // var Examplepacket= [ 165, 0, 96, 33, 1, 4, 2, 196, 3, 232 ]
    console.log('time: ', time);
    var message = {};
    var destination = 96; //96 pump 1
    var source = 16; //16= controller of some sort
    var action = 1; //1= set speed mode, unsure if other modes
    var length = 4; //for speed, i don't think this changes from 4,
    var command = 3; //3= run program , 2= run/save? at speed????
    var subcommand = 43; //33 = run program xx / turn off pump, 39-42, save P1-4 as xx, 43 set pump timer for xx min || command =2; subcommand - 96 or 196 then might be linked to speed 1
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
    message.packet = [165, 0, destination, source, action, 6, command, subcommand, commandHighBit, commandLowBit, timerHighBit, timerLowBit];
    // packet['byte']= [165, 0, destination, source, action, 2, command, subcommand, ]
    message.name = 'Run Pump at ' + rpm;

    addToQueue (message);
  }
};
