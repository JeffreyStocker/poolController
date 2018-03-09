class Message {
  constructor(packet, name = 'unknown', options = {
    timer: 250,
    logLevel: 'info',
    source: 16,
    destination: 96,
    acknowledgment: null
  }) {

    if (!Array.isArray(packet)) { throw Error('packet must be a array'); }

    if (typeof arguments[arguments.length - 1] === 'function') {
      this.callback = arguments[arguments.length - 1];
    } else {
      this.callback = () => {};
    }

    if (typeof options === 'function') {
      options = {};
    }

    this.logLevel = options.logLevel || 'info';
    this.name = name;
    if (options.timers === undefined || options.timers < 0) {
      this.timers = null;
    } else {
      this.timers = options.timers;
    }

    this.source = options.source || 16;
    this.destination = options.destination || 96;
    this.originalPacket = packet.slice();
    this.acknowledgment = options.acknowledgment || null;
  }

  get packet () {
    return this.preparePacketForSending(this.originalPacket);
  }

  get outputInfo() {
    return this.name + ' [' + this.originalPacket + ']';
  }

  isPacket (packet) {
    if (Array.isArray(packet) && packet[0] === 165 && packet[1] === 0) {
      return true;
    }
    return false;
  }

  setDestAndSource (destination, source, startPos) {
    startPos = startPos || this.findStart(this.originalPacket);
    this.setDestination(destination, startPos);
    this.setSource(source, startPos);
  }

  setDestination (destination, startPos) {
    if (!destination && typeof destination !== 'number') { return undefined; }
    this.destination = destination;
    startPos = startPos || this.findStart(this.originalPacket);
    this.originalPacket[startPos + 2] = destination;
    // return this.packet;
  }

  setSource (source, startPos) {
    var startPos;
    if (!source && typeof source !== 'number') { return undefined; }
    this.source = source;
    startPos = startPos || this.findStart(this.originalPacket);
    this.originalPacket[startPos + 3] = source;
    // return this.packet;
  }

  endMessage (err, data) {
    if (err) {

    }
    this.callback(err, data);
  }

  returnAcknowledgmentFromPacket (packet) {
    return this.flipSourceAndDestination(packet);
  }

  isAcknowledgment(packetToCheck) {
    if (this.returnAcknowledgmentFromPacket(this.originalPacket).toString() === packetToCheck.toString()) {
      return true;
    } else {
      return false;
    }
  }

  tryAcknowledgment (packet) {
    if (!packet) {
      return false;
    }
    var ackType = typeof this.acknowledgment;
    if (ackType === 'function') {
      var test = ackType(packet);
      if (test === true || test === false) {
        return test;
      }
    }
    if (this.acknowledgment && this.acknowledgment.toString() === packet.toString()) {
      return true;
    } else if (this.isAcknowledgment(packet) === true) {
      return true;
    }
    return false;
  }

  flipSourceAndDestination (packet) {
    //flips the destination and source bits
    if (Array.isArray(packet) !== true) {
      throw Error ('flipSourceAndDestinationFromStrippedPacket: Input is not an Array');
    }
    var startByte = this.findStart(packet);
    var destination = startByte + 2;
    var source = startByte + 3;

    var output = packet.slice(); //needed this or the orginal array was changed
    var temp = output[destination];
    output[destination] = output[source];
    output[source] = temp;

    return output;
  }

  findType(packet) {
    var type = typeof packet;
    if (type !== 'Object') {
      return type;
    }
    return packet.constructor.name;
  }

  sliceStringByRecurringAmounts (str = '', val = 1) {
    var output = [];
    if (typeof str !== 'string') { throw 'Incoming value must be a string'; }
    var numberOfTimesToSlice = Math.ceil(str.length / val);
    for (var i = 0; i < numberOfTimesToSlice; i++) {
      let position = i * val;
      if (i === numberOfTimesToSlice) {
        output.push(str.slice(position, str.length - 1));
      } else {
        output.push(str.slice(position, position + val));
      }
    }
    return output;
  }

  isHexString(str) {
    var expression = new RegExp('^([0-7A-F][0-7A-F])+$', 'i');
    return expression.test(str);
  }

  isHexArray (array) {
    if (this.findType(array) !== 'Array') {
      return false;
    }
    array.forEach(element => {
      if (!this.isHexString(element)) {
        return false;
      }
    });
    return true;
  }

  convertHexArrayToByteArray (hexarray, transformIntoArray = false) {
    //https://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript
    //converts an array/buffer of hex into numeric
    //this is a lot easier to manipulate
    var output = hexarray.map(function(element) {
      return parseInt(element, 16);
    });
    //if transform into a array, converts to a standard array via [...output]
    return transformIntoArray === false ? output : [...output];
  }

  returnArrayFromBuffer(buffer) {
    //https://stackoverflow.com/questions/18148827/convert-buffer-to-array
    return Array.prototype.slice.call(buffer, 0);
    //or [...exampleBuffer]
  }

  isStatusMessage(packet) {
    if (this.isPacket(packet) && packet[4] === 7) {
      return true;
    }
    return false;
  }

  findStart (packet) {
    if (Array.isArray(packet) !== true) { throw new Error ('findStart: packet must be an array'); }

    var indexOfStart = packet.indexOf(165);
    if (packet[indexOfStart + 1] === 0) {
      return indexOfStart;
    } else {
      return -1;
    }
  }

  hasStartByte (packet) {
    if (Array.isArray(packet) !== true) { throw new Error ('hasStartByte: packet must be an array'); }
    var indexOfStart = packet.indexOf(165);

    if (indexOfStart === -1) {
      return false;
    } else if (indexOfStart >= 0 ) {
      return true;
    } else {
      return null;
      throw new Error ('hasStartByte: Error: 165 Bit location caused an Error');
    }
  }

  stripHeader (packet, StartOfPacket) {
    if (!Array.isArray(packet)) { return undefined; }
    StartOfPacket = StartOfPacket || this.findStart(packet);

    if (StartOfPacket === -1) {
      return packet;
    } else {
      return packet.slice (StartOfPacket, packet.length); //removes the high and low checksum bytes in back and the HEADER
    }
  }

  stripchecksum (packet, start) {
    if (!Array.isArray(packet)) { return undefined; }

    start = start || this.findStart(packet);
    if (start !== -1) {
      // console.log ('packet: ', packet);
      // console.log ('start: ', start);
      // console.log ('startPacket: ', packet[start + 5]);
      // console.log ('endPacket: ', packet[start + 5] + start + 6);
      let results = packet.slice (0, packet[start + 5] + start + 6);
      // console.log ('results: ', results);
      // return packet.slice (0, packet.length - 2);
      return results;
    }
  }

  processIncomingPacket(packet) {
    return this.stripPacketOfHeaderAndChecksum(packet, 'array');
  }

  stripPacketOfHeaderAndChecksum (packet, returnArrayOrBuffer = 'default') {
    //removes the HEADER and high and low bit checksum
    //converts either Buffer or array, and returns same
    var strippedPacket, buffer, startOfPacket;
    if (Buffer.isBuffer(packet) === false && Array.isArray (packet) === true) {
      var packetArray = packet;
      buffer = false;
    } else if (Buffer.isBuffer(packet) === true) {
      buffer = true;
      var packetArray = [...packet]; //convert to a normal array
    }
    startOfPacket = this.findStart(packetArray);
    strippedPacket = this.stripchecksum(packetArray, startOfPacket);
    strippedPacket = this.stripHeader(strippedPacket, startOfPacket);

    if (returnArrayOrBuffer.toLowerCase() === 'array') {
      return strippedPacket;
    } else if ( returnArrayOrBuffer.toLowerCase() === 'buffer') {
      return Buffer.from (strippedPacket);
    } else {
      return buffer === true ? Buffer.from (strippedPacket) : strippedPacket;
    }
  }

  sumOfBytes (packet) {
    var sum = packet.reduce((accumulator, element) => {
      return accumulator + element;
    }, 0);
    return sum;
  }

  combineHighPlusLowBit (highBit, lowBit) {
    //returns the checksum, calculated from the high Bit and Low bit
    return highBit * 256 + lowBit;
  }

  returnHighBit (value) {
    return parseInt(value / 256);
  }

  returnLowBit (value) {
    return value % 256;
  }

  returnChecksum (packet) {
    //returns an array [highBit, lowBit] calculated by taking the sum of the packet
    var checksum = this.sumOfBytes(packet);
    return [this.returnHighBit (checksum), this.returnLowBit (checksum)];
  }

  appendCheckSum (packet) {
    return packet.concat(this.returnChecksum(packet));
  }

  prependBuffer (packet) {
    return defaultMessages.shortPrefix.concat(packet);
  }

  prependStart (packet) {
    return defaultMessages.prefix.concat(packet);
  }

  preparePacketForSending (packet) {
    //prepares a packet ie: [2,4,3,2] for sending by adding a header and checksum high & lowbit
    // packet = packet.slice();
    packet[2] = this.destination;
    packet[3] = this.source;
    packet = this.appendCheckSum(packet);
    packet = this.prependBuffer (packet);
    return packet;
  }

  stripPacket (packet) {
    var strippedPacket = this.stripPacketOfHeaderAndChecksum(packet, 'array');

    return strippedPacket;
  }

}

/////// packet Information /////////////////////////
/*
speed #, Higher # higher priority
soler 4
slow speed 3
waterfall speed 2
heater/spa speed 1
*/

var defaultMessages = {
  prefix: [255, 0, 255, 165, 0],
  shortPrefix: [255, 0, 255],
  start: [165, 0],
  pumpToRemote:        {name: 'Set Pump to Remote', byte: [165, 0, 96, 16, 4, 1, 255],          buffer: Buffer.from('a50060100401ff0219', 'hex'),       hex: 'a50060100401ff0219'},       byteWithChecksum: [165, 0, 96, 16, 4, 1, 255, 2, 25], //intellicom set pump to remote  //works
  pumpToLocal:         {name: 'Set Pump to Local',  byte: [165, 0, 96, 16, 4, 1, 0],            buffer: Buffer.from('a5006010040100011a', 'hex'),       hex: 'a5006010040100011a'},       byteWithChecksum: [165, 0, 96, 16, 4, 1, 0, 1, 26],
  pumpExternal_Speed4: {name: 'Exteral Speed 4',    byte: [165, 0, 96, 16, 1, 4, 3, 33, 0, 32], ack: [165, 0, 16, 96, 1, 2, 0, 32], buffer: Buffer.from('a5006010010403210020015e', 'hex'), hex: 'a5006010010403210020015e'}, byteWithChecksum: [165, 0, 96, 16, 1, 4, 3, 33, 0, 32, 1, 94], //intellicom use external command i think 4 (highest his is solar  priority) (possibley with 1 min timer?)
  pumpExternal_Speed3: {name: 'Exteral Speed 3',    byte: [165, 0, 96, 16, 1, 4, 3, 33, 0, 24], ack: [165, 0, 16, 96, 1, 2, 0, 24], buffer: Buffer.from('a50060100104032100180156', 'hex'), hex: 'a50060100104032100180156'}, byteWithChecksum: [165, 0, 96, 16, 1, 4, 3, 33, 0, 24, 1, 86], //slow Speed
  pumpExternal_Speed2: {name: 'Exteral Speed 2',    byte: [165, 0, 96, 16, 1, 4, 3, 33, 0, 16], ack: [165, 0, 16, 96, 1, 2, 0, 16], buffer: Buffer.from('a5006010010403210010014e', 'hex'), hex: 'a5006010010403210010014e'}, byteWithChecksum: [165, 0, 96, 16, 1, 4, 3, 33, 0, 16, 1, 78], //waterfall
  pumpExternal_Speed1: {name: 'Exteral Speed 1',    byte: [165, 0, 96, 16, 1, 4, 3, 33, 0, 8],  ack: [165, 0, 16, 96, 1, 2, 0, 8],  buffer: Buffer.from('a50060100104032100080146', 'hex'), hex: 'a50060100104032100080146'}, byteWithChecksum: [165, 0, 96, 16, 1, 4, 3, 33, 0, 8, 1, 70], //spa
  pumpExternal_Off:    {name: 'Exteral OFF',        byte: [165, 0, 96, 16, 1, 4, 3, 33, 0, 0],  ack: [165, 0, 16, 96, 1, 2, 0, 0],  buffer: Buffer.from('a5006010010403210000013e', 'hex'), hex: 'a5006010010403210000013e'}, byteWithChecksum: [165, 0, 96, 16, 1, 4, 3, 33, 0, 0, 1, 62],
  pumpGetStatus:       {name: 'Get Pump Status',    byte: [165, 0, 96, 16, 7, 0],               buffer: Buffer.from([165, 0, 96, 16, 7, 0, 1, 28]),     hex: 'A50961670128'},             byteWithChecksum: [165, 0, 96, 16, 7, 0, 1, 28],
  pump_PowerOn:        {name: 'Set Power On',       byte: [165, 0, 96, 16, 6, 1, 10],           buffer: Buffer.from('A500601006010A0126', 'hex'),       hex: 'A500601006010A0126',        byteWithChecksum:[165, 0, 96, 16, 6, 1, 10, 1, 38]},
  pump_PowerOff:       {name: 'Set Power Off',      byte: [165, 0, 96, 16, 6, 1, 4],            buffer: Buffer.from('A50060100601040120', 'hex'),       hex: 'A50060100601040120',        byteWithChecksum:[165, 0, 96, 16, 6, 1, 4, 1, 32]},
  pumpFilter:          {name: 'Speed Filter',       byte: [165, 0, 96, 16, 5, 1, 0]},
  pumpManual:          {name: 'Speed Manual',       byte: [165, 0, 96, 16, 5, 1, 1]},
  pumpSpeed1:          {name: 'Speed 1',            byte: [165, 0, 96, 16, 5, 1, 2]},
  pumpSpeed2:          {name: 'Speed 2',            byte: [165, 0, 96, 16, 5, 1, 3]},
  pumpSpeed3:          {name: 'Speed 3',            byte: [165, 0, 96, 16, 5, 1, 4]},
  pumpSpeed4:          {name: 'Speed 4',            byte: [165, 0, 96, 16, 5, 1, 5]},
  pumpfeature1:        {name: 'feature 1',          byte: [165, 0, 96, 16, 5, 1, 6]},
  saveAndRunExternal1: {name: 'Save & Run External 1', byte: [165, 0, 96, 16, 1, 4], byteWithChecksum: [165, 0, 96, 16, 1, 4, 2, 196]}, //needs a speed high and low bit added on the end before the checksum
};

var addresses = {
  Chlorinator: [2, 16], // 	Chlorinator (This is a different type of packet)
  Broadcast: 15,
  Pool_controller: 16, // 	Pool controller (EasyTouch, intellicom, et al)
  RemoteWiredController: 32,
  RemoteWirelessController: 34, 	//(Screen Logic, or any apps that connect to it, like this one)
  Pump1: 96,
  Pump2: 97,
  Pump3: 98,
  Pump4: 99,
  Pump5: 100,
  Pump6: 101,
  Pump7: 102,
  Pump8: 103,
  Pump9: 104,
  Pump10: 105,
  Pump11: 106,
  Pump12: 107,
  Pump13: 108,
  Pump14: 109,
  Pump15: 110,
  Pump16: 111,
};

module.exports = {
  defaultMessages,
  Message,
  addresses,

  returnDefaultMessage(preBuiltMessage, destination = 96, options = {name: null, logLevel: 'debug'}, callback = () => {} ) {
    var logLevel, name;
    if (!options) {
      name = defaultMessages[preBuiltMessage].name;
      logLevel = true;
    } else {
      name = options.name || defaultMessages[preBuiltMessage].name;
      if (options.logLevel !== undefined) {
        logLevel = options.logLevel;
      } else {
        logLevel = 'debug';
      }
    }
    var message = defaultMessages[preBuiltMessage].byte.slice();
    message[2] = destination;
    return new Message (message, name, {logLevel}, callback);
  },

  defaultStatusMessage(destination = 96, options = {}, callback = () => {}) {
    if (typeof arguments[arguments.length - 1] === 'function') {
      callback = arguments[arguments.length - 1];
    }
    if (!options || typeof options !== 'object') {
      options = {};
    }
    options.logLevel = options.logLevel || 'debug';
    var message = new Message (
      defaultMessages.pumpGetStatus.byte,
      defaultMessages.pumpGetStatus.name,
      {timers: options.timers, logLevel: options.logLevel},
      callback
    );
    message.setDestination(destination);
    return message;
  },

  defaultPumpPowerMessage (powerState, callback = () => {}) {
    var defaultMessage;
    if (typeof arguments[arguments.length - 1] === 'function') {
      callback = arguments[arguments.length - 1];
    }

    if (powerState === 'on') {
      defaultMessage = defaultMessages.pump_PowerOn;
      return new Message(defaultMessage.byte, defaultMessage.name, callback);
    } else if (powerState === 'off') {
      defaultMessage = defaultMessages.pump_PowerOff;
      return new Message(defaultMessage.byte, defaultMessage.name, {timer: 'off'}, callback);
    } else {
      let errorMessage = 'Error: In order to change the pump Power state, you need to enter true/false or on/off';
      callback (errorMessage);
      throw new Error(errorMessage);
    }
  },

  defaultPumpControlPanelMessage (powerState, options = {}, callback = () => {}) {
    if (typeof arguments[arguments.length - 1] === 'function') {
      callback = arguments[arguments.length - 1];
    }

    if (!options || typeof options !== 'object') {
      options = {};
    }

    options.logLevel = options.logLevel || 'debug';

    var defaultMessage;
    if (powerState.toLowerCase() === 'remote') {
      return new Message (defaultMessages.pumpToRemote.byte, defaultMessages.pumpToRemote.name, options, callback);
      // defaultMessage = defaultMessages.pumpToRemote;
    } else if (powerState.toLowerCase() === 'local') {
      return new Message (defaultMessages.pumpToLocal.byte, defaultMessages.pumpToLocal.name, options, callback);
      // defaultMessage = defaultMessages.pumpToLocal;
    } else {
      let errorMessage = 'Error: In order to change the pump Power state, you need to enter local or remote';
      callback(errorMessage);
      throw new Error(errorMessage);
    }
  },

  defaultPumpSpeedMessage (programNumber, callback = () => {}) {
    if (typeof arguments[arguments.length - 1] === 'function') {
      callback = arguments[arguments.length - 1];
    }

    if (programNumber > 0 && programNumber < 5) {
      var speedname = 'pumpSpeed' + programNumber;
      return new Message (defaultMessages[speedname].byte, defaultMessages[speedname].name, callback);
    }
  },

  defaultIntellicomMessage (speed = 0, options, callback = ()=>{}) {
    if (typeof arguments[arguments.length - 1] === 'function') {
      callback = arguments[arguments.length - 1];
    }

    if (speed === 0) {
      return new Message (
        defaultMessages.pumpExternal_Off.byte,
        defaultMessages.pumpExternal_Off.name,
        {acknowledgment: defaultMessages.pumpExternal_Off.ack, timers: 0},
        callback
      );
    } else if (speed > 0 && speed < 5) {
      var speedMsg = defaultMessages['pumpExternal_Speed' + speed];
      return new Message (
        speedMsg.byte,
        speedMsg.name,
        {acknowledgment: speedMsg.ack, timers: 10000},
        callback
      );
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
      this.originalPacket = defaultPacket.packet;
      this.name = defaultPacket.name;
      this.originalPacket = defaultPacket.packet;
    } else {

    }
  } else if (Array.isArray(packet)) {
    this.originalPacket = this.convertToDefaultlPacket(packet);
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



