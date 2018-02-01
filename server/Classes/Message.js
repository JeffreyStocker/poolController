class Message {
  constructor(message, name) {
    this.message = this.returnDefaultMessage(message);
    this.name = name;
    this.originalMessage = message;
    this.retryAttempts = 0;
  }

  isAcknowledgment(messageToCheck) {
    var originalByteArray = this.flipSourceAndDestinationFromStrippedMessage(this.message);
    if (originalByteArray.toString() === messageToCheck.toString()) {
      return true;
    } else {
      return false;
    }
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

  returnDefaultMessage (message) {
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
      this.isHexArray === true ? convertedMessage = convertHexArrayToByteArray (message) : convertedMessage = message;
      break;
    }
    case 'string': {
      if (message.length % 2 !== 0) { throw 'A message string must be divisable by 2'; }
      if (isHexString(message)) {
        convertedMessage = this.sliceStringByRecurringAmounts(message, 2);
        convertedMessage = convertHexArrayToByteArray(convertedMessage);
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

  sliceStringByRecurringAmounts (str, val) {
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

  hasHeader (message) {
    var indexOfStart = message.indexOf(165);
    if (indexOfStart === -1) {
      console.log ('hasHeader: Error: Message does not have a 165 bit');
    } else if (indexOfStart === 0) {
      return false;
    } else if (indexOfStart >= 1) {
      return true;
    } else {
      console.log ('hasHeader: Error: 165 Bit location caused an Error');
    }
  }

  stripMessageOfHeaderAndChecksum (message, returnArrayOrBuffer = null) {
    //removes the HEADER and high and low bit checksum
    //converts either Buffer or array, and returns same
    if (Buffer.isBuffer(message) === false && Array.isArray (message) === true) {
      var messageArray = message;
    } else if (Buffer.isBuffer(message) === true) {
      var buffer = true;
      var messageArray = [...message]; //convert to a normal array
    }
    var StartOfMessege = messageArray.indexOf(165);
    if (StartOfMessege === -1) {
      console.log (message);
      return 'Error No Start (165) byte the Message';
    }
    var strippedMessage = message.slice (StartOfMessege, message.length - 2); //removes the high and low checksum bytes in back and the HEADER

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

  returnHighBit (value) {
    return parseInt(value / 256);
  }

  returnLowBit (value) {
    return value % 256;
  }

  combineHighPlusLowBit (highBit, lowBit) {
    //returns the checksum, calculated from the high Bit and Low bit
    return highBit * 256 + lowBit;
  }

  appendCheckSum (packet) {
    //appends the
    var checksum = sumOfBytes(packet);
    var highAndLowBitArray = [];

    highAndLowBitArray.push(returnHighBit(checksum));
    highAndLowBitArray.push(returnLowBit(checksum));
    return packet.concat(highAndLowBitArray);
  }

  addOnHeaderToPacket (packet) {
    return [255, 0, 255].concat(packet);
  }

  preparePacketForSending (packet) {
    //prepares a packet ie: [2,4,3,2] for sending by adding a header and checksum high & lowbit
    var clonePacket = packet;
    clonePacket = appendCheckSum (clonePacket);
    clonePacket = addOnHeaderToPacket (clonePacket);
    return clonePacket;
  }

  returnHighAndLowBitOfChecksum (message) {
    //returns an array [highBit, lowBit] calculated by taking the sum of the message
    var checksum = sumOfBytes(message);
    var checksumLargeandSmallBit = [returnHighBit (checksum), returnLowBit (checksum)];
    return checksumLargeandSmallBit;
  }

}

module.exports = Message;