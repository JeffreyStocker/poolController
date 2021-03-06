var msg = require (process.env.NODE_PATH + '/server/equipment/pentair/PentairMessages');
// var addToQueue2 = require (process.env.NODE_PATH + '/server/equipment/pentair/queue').addToQueue2;
var logger = require (process.env.NODE_PATH + '/server/logging/winston').sendToLogs;
var queues = requireGlob('GroupOfQueues');

// var addToQueue = function (message) {
//   queues.addMessageToQueue('Pump1', message);
// };

module.exports = {

  runIntellicomPumpSpeed (speed = 0, queueName, interval = 10000, callback = () => {}) {
    if (typeof arguments[arguments.length - 1] === 'function') {
      callback = arguments[arguments.length - 1];
    }
    if (typeof queueName === 'function') {
      queueName = null;
    }
    if (typeof interval === 'function') {
      interval = 10000;
    }

    // var message = msg.defaultIntellicomMessage(speed, {timers: interval}, callback);
    // addToQueue(message);
    queues.addMessageToQueue(queueName, msg.defaultIntellicomMessage(speed, {timers: interval}, callback));
  },

  pumpControlPanelState (powerState, queueName, callback = () => {}) {
    if (!powerState || typeof powerState !== 'string') {
      return callback ('pumpControlPanelState requires a powerState and must be a string', null);
    } else if (!queueName || typeof queueName !== 'string') {
      return callback ('pumpControlPanelState requires a queueName and must be a string', null);
    }

    if (powerState === 'toggle') {
      queues.addMessageToQueue(queueName, msg.defaultPumpControlPanelMessage('remote', callback));
      // addToQueue(msg.defaultPumpControlPanelMessage('remote'));
      queues.addMessageToQueue(queueName, msg.defaultPumpControlPanelMessage('local', callback));
      // addToQueue(msg.defaultPumpControlPanelMessage('local', callback));
    } else if (powerState === 'remote' || powerState === 'local') {
      queues.addMessageToQueue(queueName, msg.defaultPumpControlPanelMessage(powerState, callback));
      // addToQueue(msg.defaultPumpControlPanelMessage(powerState, callback));
    } else {
      return callback('Error: In order to change the pump control panel, "remote", "local", or "toggle" should be used', null);
    }
  },


  pumpPower (powerState, queueName, callback = () => {}) {
    if (!powerState || typeof powerState !== 'string') {
      return callback ('pumpControlPanelState requires a powerState and must be a string', null);
    } else if (!queueName || typeof queueName !== 'string') {
      return callback ('powerState requires a queueName and must be a string', null);
    }

    if (powerState === 'toggle') {
      queues.addMessageToQueue(queueName, msg.defaultPumpPowerMessage('off'));
      // addToQueue(msg.defaultPumpPowerMessage('off'));
      queues.addMessageToQueue(queueName, msg.defaultPumpPowerMessage('on', callback));
      // addToQueue(msg.defaultPumpPowerMessage('on', callback));
    } else if (powerState === 'on' || powerState === 'off') {
      queues.addMessageToQueue(queueName, msg.defaultPumpPowerMessage(powerState, callback));
      // addToQueue(msg.defaultPumpPowerMessage(powerState, callback));
    } else {
      return callback('Error: In order to change the pump Power state, you need to enter "on" or "off" or "toggle"', null);
    }
  },

  runRepeatingStatus(state = 'toggle', queueName, interval = 1000, callback = () => {}) {
    if (!state || typeof state !== 'string') {
      return callback ('runRepeatingStatus requires a state and must be a string', null);
    } else if (!queueName || typeof queueName !== 'string') {
      return callback ('runRepeatingStatus requires a queueName and must be a string', null);
    }

    if (state === 'toggle') {
      state = queues.returnQueue(queueName).hasStatusTimer() ? 'off' : 'on';
    }

    if (state === 'on') {
      queues.addMessageToQueue(queueName, msg.defaultStatusMessage(undefined, {timers: {name: 'status', interval}}, callback));
      // addToQueue(msg.defaultStatusMessage(undefined, {timers: {name: 'status', interval: 1000}}, callback));
    } else if (state === 'off') {
      queues.addMessageToQueue(queueName, msg.defaultStatusMessage(undefined, {timers: {name: 'status', interval: 0}}, callback));
      // addToQueue(msg.defaultStatusMessage(undefined, {timers: {name: 'status', interval: 0}}, callback));
    } else {
      callback ('runRepeatingStatus state variable must be "toggle", "on" or "off"', null);
    }
  },


  runPumpAtSpeed (rpm, queueName = 'Pump1', callback = () => {}) {
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
    message.packet = [165, 0, destination, source, action, length, command, subcommand, commandHighBit, commandLowBit];
    message.name = 'Run Pump at ' + rpm;

    // addToQueue (new Message (message.packet, message.name, callback));
    queues.addMessageToQueue(queueName, new Message (message.packet, message.name, callback));
  },


  runPumpProgram (speed, queueName = 'Pump1', callback = () => {}) {
    if (typeof arguments[arguments.length - 1] === 'function') {
      callback = arguments[arguments.length - 1];
    }
    if (speed === 0) {
      pumpPower('toogle', queueName, callback);
    } else if (speed >= 1 || speed <= 4) {
      queues.addMessageToQueue(queueName, msg.defaultPumpSpeedMessage(speed, callback));
    } else {
      callback ('Speed outside Correct Range (0-4)', null);
    }
  },

  //wip
  setPumpSpeed (rpm, program, destination = 96, source = 16, callback = () => {}) {
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
    message.packet = [165, 0, destination, source, action, length, command, subcommand, commandHighBit, commandLowBit];
    message.name = 'Run Pump Program: ' + program + ' at ' + rpm;

    addToQueue (packet);
    // queues.addMessageToQueue(queueName, msg.defaultPumpControlPanelMessage(powerState, callback));
  },

  //wip
  setPumpTimer (min, callback = () => {}) {
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

    message.packet = [165, 0, destination, source, action, 3, command, commandHighBit, commandLowBit];
    // packet['byte']= [165, 0, destination, source, action, length, command, subcommand, 3,232,commandHighBit, commandLowBit]
    // packet['byte']= [165, 0, destination, source, action, length, command, subcommand, 3,232,commandHighBit, commandLowBit]
    message.packet = [ 165, 0, 96, 16, 1, 4, 3, 43, 1, 30 ];
    message.packet = [ 165, 0, 96, 16, 1, 2, 3, 43];
    message.packet = [ 165, 0, 96, 16, 1, 2, 3, 43];
    message.name = 'Run Pump With Timer of ' + min;
    // packet.name= 'Run Pump at ' + rpm

    // queues.addMessageToQueue(queueName, msg.defaultPumpControlPanelMessage(powerState, callback));
    addToQueue (message);
  },


  manualPumpControl (rpm, time = 1, action = 1, command = 3, subcommand = 33, destination = 96, source = 16, callback = () => {}) {
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

    // var checksumHighBit = //checksum high added later in code
    // var checksumLowBit = //chechsum low added later in code
    // console.log('commandHighBit: ', commandHighBit);
    // console.log('returnLowBit (rpm): ', commandLowBit);

    // packet['byte']= [165, 0, destination, source, action, 6, command, subcommand, 3,232,commandHighBit, commandLowBit]  //manual set to 1000 rpm
    // packet['byte']= [165, 0, destination, source, action, length, command, subcommand, commandHighBit, commandLowBit]
    message.packet = [165, 0, destination, source, action, 6, command, subcommand, commandHighBit, commandLowBit, timerHighBit, timerLowBit];
    // packet['byte']= [165, 0, destination, source, action, 2, command, subcommand, ]
    message.name = 'Manual Pump Control ' + rpm;


    addToQueue (new Message(message.packet, message.name));
    // queues.addMessageToQueue(queueName, new Message(message.packet, message.name));
  }
};
