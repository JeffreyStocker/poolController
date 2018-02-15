var msg = require (process.env.NODE_PATH + '/server/messages');
var { exteralTimer } = require (process.env.NODE_PATH + '/server/variables');

class Message {
  constructor(message, name = 'unknown', options = {
    numberOfRetries: 3,
    logLevel: 'info'
  }, callback = ()=>{}) {

    this.retryAttempts = 0;
    this.acknowledgment = this.flipSourceAndDestinationFromStrippedMessage(message);

    if (typeof options === 'function') {
      this.callback = options;
      options = {};
    }

    this.numberOfRetries = options.numberOfRetries || 3;
    this.logLevel = options.logLevel || 'info';

    if (typeof callback === 'function') {
      this.callback = callback;
    } else {
      this.callback = () => {};
    }

    if (typeof message === 'string') {
      let defaultMessage = this.returnDefaults(message);
      if (!!defaultMessage) {
        this.message = defaultMessage.message;
        this.name = defaultMessage.name;
        this.originalMessage = defaultMessage.message;
      } else {

      }
    } else if (Array.isArray(message)) {
      this.message = this.convertToDefaultMessage(message);
      this.name = name;
      this.originalMessage = message;
    }
  }

  setDestination (destintation) {
    if (!destintation && typeof destintation !== 'number') { return undefined; }
    this.message[2] = destination;
    return this.message;
  }

  setSource (source) {
    if (!source && typeof source !== 'number') { return undefined; }
    this.message[3] = source;
    return this.message;
  }

  endMessage (err, data) {
    if (err) {

    }
    this.callback(err, data);
  }

  isAcknowledgment(messageToCheck) {
    if (this.acknowledgment.toString() === messageToCheck.toString()) {
      return true;
    } else {
      return false;
    }
  }

  tryAcknowledgment (messageToCheck) {
    if (this.isAcknowledgment(messageToCheck) === true) {
      return true;
    } else if (this.retryAttempts <= this.numberOfRetries) {
      this.retryAttempts++;
      return this.retryAttempts;
    }
    this.retryAttempts = 0;
    return false;
  }

  flipSourceAndDestinationFromStrippedMessage (buffer) {
    //flips the destinttion and source bits
    //
    if (Array.isArray(buffer) !== true) {
      return Error ('flipSourceAndDestinationFromStrippedMessage: Input is not an Array');
    }
    //need to add prefix checking
    //assuming this is a stripped message
    // buffer=exampleOfStrippedMessage = [165,0,16,96,7,15,4,0,0,0,0,0,0,0,0,0,0,0,0,16,12]

    var output = buffer.slice(); //needed this or the orginal array was changed
    var temp = output[2];
    output[2] = output[3];
    output[3] = temp;

    return output;
  }

  findType(message) {
    var type = typeof message;
    if (type !== 'Object') {
      return type;
    }
    return message.constructor.name;
  }

  convertToDefaultMessage (message) {
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

  hasStartByte (message) {
    if (Array.isArray(message) !== true) { return null; }
    var indexOfStart = message.indexOf(165);

    if (indexOfStart === -1) {
      return false;
    } else if (indexOfStart >= 0 ) {
      return true;
    } else {
      return null;
      throw new Error ('hasStartByte: Error: 165 Bit location caused an Error');
    }
  }

  stripHeader (message) {
    if (!Array.isArray(message)) { return undefined; }
    var StartOfMessege = messageArray.indexOf(165);
    if (StartOfMessege === -1) {
      return message;
    } else {
      return message.slice (StartOfMessege, message.length); //removes the high and low checksum bytes in back and the HEADER
    }
  }

  stripchecksum (message) {
    if (!Array.isArray(message)) { return undefined; }
    return message.slice (0, message.length - 2);
  }

  stripMessageOfHeaderAndChecksum (message, returnArrayOrBuffer = null) {
    //removes the HEADER and high and low bit checksum
    //converts either Buffer or array, and returns same
    var strippedMessage;
    if (Buffer.isBuffer(message) === false && Array.isArray (message) === true) {
      var messageArray = message;
    } else if (Buffer.isBuffer(message) === true) {
      var buffer = true;
      var messageArray = [...message]; //convert to a normal array
    }

    strippedMessage = this.stripchecksum(message);
    strippedMessage = this.stripHeader(message);

    if (returnArrayOrBuffer.toLowerCase() === 'array') {
      return strippedMessage;
    } else if ( returnArrayOrBuffer.toLowerCase() === 'buffer') {
      return Buffer.from (strippedMessage);
    } else {
      return buffer === true ? Buffer.from (strippedMessage) : strippedMessage;
    }
  }

  sumOfBytes (message) {
    // if (this.findType(message) !== 'Array') { return undefined;}
    var sum = message.reduce((accumulator, element) => {
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

  returnChecksum (message) {
    //returns an array [highBit, lowBit] calculated by taking the sum of the message
    var checksum = this.sumOfBytes(message);
    return [this.returnHighBit (checksum), this.returnLowBit (checksum)];
  }

  appendCheckSum (message) {
    return message.concat(returnChecksum(message));
  }

  prependBuffer (message) {
    return this.returnDefault('buffer').concat(message);
  }

  addStartToMessage (message) {
    return this.returnDefaultreturnDefault('start').concat(message);
  }

  prepareMessageForSending (message) {
    //prepares a packet ie: [2,4,3,2] for sending by adding a header and checksum high & lowbit
    message = this.prependBuffer (message);
    message = this.addBufferToMessage(message);
    return message;
  }

  returnDefault(name, destination = 96, source = 16) {
    var defaults = {
      header: [255, 0, 255, 165, 0], //should not be used as messages should have this by default
      buffer: [255, 0, 255],
      start: [165, 0], //should not be used as messages should have this by default
      pumpToRemote:       {name: 'Set Pump to Remote', message: [165, 0, destination, source, 4, 1, 255, 2, 25 ]}, //intellicom set pump to remote  //works
      pumpToLocal:        {name: 'Set Pump to Local',  message: [165, 0, destination, source, 4, 1, 0, 1, 26 ]},
      pumpExternalSpeed4: {name: 'Exteral Speed 4',    message: [165, 0, destination, source, 1, 4, 3, 33, 0, 32, 1, 94 ]}, //intellicom use external command i think 4 (highest his is solar  priority) (possibley with 1 min timer?)
      pumpExternalSpeed3: {name: 'Exteral Speed 3',    message: [165, 0, destination, source, 1, 4, 3, 33, 0, 24, 1, 86 ]}, //slow Speed
      pumpExternalSpeed2: {name: 'Exteral Speed 2',    message: [165, 0, destination, source, 1, 4, 3, 33, 0, 16, 1, 78 ]}, //waterfall
      pumpExternalSpeed1: {name: 'Exteral Speed 1',    message: [165, 0, destination, source, 1, 4, 3, 33, 0, 8, 1, 70 ]}, //spa
      pumpOff:            {name: 'Speed OFF',          message: [165, 0, destination, source, 1, 4, 3, 33, 0, 0, 1, 62 ]},
      pumpGetStatus:      {name: 'Get Pump Status',    message: [165, 0, destination, source, 7, 0, 1, 28 ]},
      pumpPowerOn:        {name: 'Set Power On',       message: [165, 0, destination, source, 6, 1, 10 ]},
      pumpPowerOff:       {name: 'Set Power Off',      message: [165, 0, destination, source, 6, 1, 4 ]},
    };
    return defaults[name];
  }
}

module.exports = Message;


var MessagePumpPower = exports.pumpPower = function (powerState, callback = ()=>{}) {
  var core;
  if (powerState === 'on') {
    core = msg.pump_PowerOn;
  } else if (powerState === 'off') {
    core = msg.pump_PowerOff;
  } else {
    return 'Error: In order to change the pump Power state, you need to enter true/false or on/off';
  }
  return new Message(core, 'Pump Power' + powerState, {callback: callback});
};

var pumpControlPanelState = exports.pumpControlPanelState = function (powerState, callback = ()=>{}) {
  var core;
  if (powerState === 'remote') {
    core = mgs.pumpToRemote;
  } else if (powerState === 'local') {
    core = mgs.pumpToLocal;
  } else {
    return 'Error: In order to change the pump Power state, you need to enter true/false or on/off';
  }
  return new Message (core.byte, core.name, callback);
};

var messagePumpSpeed = function (rpm, program, destination = 96, source = 16, callback = ()=>{}) {
  var possibleSubcommands = {
    0: 33,
    1: 39,
    2: 40,
    3: 41,
    4: 42,
  };
  var packet = {};
  var action = 1;           //1= set speed mode, unsure if other modes
  var length = 4;            //for speed, i don't think this changes from 4,
  var command = 33;           //3= run program , 2= run/save? at speed????
  var subcommand = possibleSubcommands[program]; //33 = run program xx / turn off pump, 39-42, save P1-4 as xx, 43 set pump timer for xx min || command =2; subcommand - 96 or 196 then might be linked to speed 1
  var commandHighBit = returnHighBit (rpm); //changes, either RPM high or timer HH or MM
  var commandLowBit = returnLowBit (rpm); //changes either rpm low, or timer MM
  // var checksumHighBit = //checksum high added later in code
  // var checksumLowBit = //chechsum low added later in code
  // console.log('commandHighBit: ' , commandHighBit);
  // console.log('returnLowBit (rpm): ' , commandLowBit);
  packet['byte'] = [165, 0, destination, source, action, length, command, subcommand, commandHighBit, commandLowBit];
  // console.log (packet.byte)
  packet.name = 'Run Pump Program: ' + program + ' at ' + rpm;
  return new Message(packet.byte, packet.name, callback);
};

var runIntellicomPumpSpeed = exports.runIntellicomPumpSpeed = function (speed = 0, interval = 10000, callback = ()=>{}) {
  var externalVariable = {
    0: msg.pump_Off,
    1: msg.pumpExternal_Speed1,
    2: msg.pumpExternal_Speed2,
    3: msg.pumpExternal_Speed3,
    4: msg.pumpExternal_Speed4
  };
  if (!speed === 0) {
    exteralTimer = setInterval( function() {
      addToQueue(externalVariable[speed]);
    }, interval);
  }
  return new Message (externalVariable[speed].byte, externalVariable[speed].name, callback);
};