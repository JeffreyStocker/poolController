var { Message, defaultMessages } = require (process.env.NODE_PATH + '/server/equipment/pentair/PentairMessages.js');

module.exports = {
  returnDefaultMessage(preBuiltMessage, destination = 96, options = {name: null, logLevel: true} ) {
    var logLevel, name;
    if (!options) {
      name = defaultMessages[preBuiltMessage].name;
      logLevel = true;
    } else {
      name = options.name || defaultMessages[preBuiltMessage].name;
      (options.logLevel !== undefined && typeof options.logLevel === 'boolean') ? logLevel = options.logLevel : logLevel = true;
    }
    var message = defaultMessages[preBuiltMessage].byte.slice();
    message[2] = destination;
    return new Message (message, name, {logLevel});
  },

  defaultStatusMessage(destination = 96, callback) {
    var message = new Message (defaultMessages.pumpGetStatus.byte, defaultMessages.pumpGetStatus.name, {logLevel: 'debug'}, callback);
    message.setDestination(destination);
    return message;
  },

  defaultPumpPowerMessage (powerState, callback) {
    var defaultMessage;
    if (powerState === 'on') {
      defaultMessage = defaultMessages.pump_PowerOn;
    } else if (powerState === 'off') {
      defaultMessage = defaultMessages.pump_PowerOff;
    } else {
      throw new Error('Error: In order to change the pump Power state, you need to enter true/false or on/off');
    }
    return new Message(defaultMessage.byte, defaultMessage.name, callback);
  },

  defaultPumpControlPanelMessage (powerState, callback) {
    var defaultMessage;
    if (powerState.toLowerCase() === 'remote') {
      return new Message (defaultMessages.pumpToRemote.byte, defaultMessages.pumpToRemote.name, callback);
      defaultMessage = defaultMessages.pumpToRemote;
    } else if (powerState.toLowerCase() === 'local') {
      return new Message (defaultMessages.pumpToLocal.byte, defaultMessages.pumpToLocal.name, callback);
      defaultMessage = defaultMessages.pumpToLocal;
    } else {
      throw new Error('Error: In order to change the pump Power state, you need to enter local or remote');
    }
  },

  defaultIntellicomMessage (speed = 0, callback = ()=>{}) {
    if (speed === 0) {
      return new Message (defaultMessages.pumpExternal_Off.byte, defaultMessages.pumpExternal_Off.name, callback);
    } else if (speed > 0 && speed < 5) {
      var speedname = 'pumpExternal_Speed' + speed;
      return new Message (defaultMessages[speedname].byte, defaultMessages[speedname].name, callback);
    }
  }

};





//not working
var messagePumpSpeed = function (rpm, program, destination = 96, callback = ()=>{}) {
  var possibleSubcommands = {
    0: 33,
    1: 39,
    2: 40,
    3: 41,
    4: 42,
  };
  var packet = {};
  var action = 1; //1= set speed mode, unsure if other modes
  var length = 4; //for speed, i don't think this changes from 4,
  var command = 33; //3= run program , 2= run/save? at speed????
  var subcommand = possibleSubcommands[program]; //33 = run program xx / turn off pump, 39-42, save P1-4 as xx, 43 set pump timer for xx min || command =2; subcommand - 96 or 196 then might be linked to speed 1
  var commandHighBit = returnHighBit (rpm); //changes, either RPM high or timer HH or MM
  var commandLowBit = returnLowBit (rpm); //changes either rpm low, or timer MM
  packet['byte'] = [165, 0, destination, source, action, length, command, subcommand, commandHighBit, commandLowBit];
  packet.name = 'Run Pump Program: ' + program + ' at ' + rpm;
  return new Message(packet.byte, packet.name, callback);
};

//// not sure if going to keep these
var convertPacket = function() {
  if (typeof packet === 'string') {
    let defaultlPacket = this.returnDefaults(packet);
    if (!!defaultPacket) {
      this.packet = defaultPacket.packet;
      this.name = defaultPacket.name;
      this.originalPacket = defaultPacket.packet;
    } else {

    }
  } else if (Array.isArray(packet)) {
    this.packet = this.convertToDefaultlPacket(packet);
    this.name = name;
    this.originalPacket = packet;
  }

};

var convertToDefaultMessage = function (message) {
  // var type = this.findType(message);
  var type, convertedMessage;
  try {
    type = message.constructor.name;
  } catch (err) {
    return;
  }

  switch (type) {
  case 'buffer': {
    convertedMessage = this.returnArrayFromBuffer(message);
    break;
  }
  case 'array': {
    this.isHexArray === true ? convertedMessage = this.convertHexArrayToByteArray (message) : convertedMessage = message;
    break;
  }
  case 'string': {
    if (message.length % 2 !== 0) { throw 'A message string must be divisable by 2'; }
    if (this.isHexString(message)) {
      convertedMessage = this.sliceStringByRecurringAmounts(message, 2);
      convertedMessage = this.convertHexArrayToByteArray(convertedMessage);
    } else {
      convertedMessage = this.sliceStringByRecurringAmounts(message, 2);
    }
    break;
  }
  case 'number': {
    if (message.length % 2 !== 0) { throw 'A message string must be diviable by 2'; }
    convertedMessage = this.sliceStringByRecurringAmounts(message.toString(), 2);
    break;
  }
  default:
    break;
  }
  return convertedMessage;
};