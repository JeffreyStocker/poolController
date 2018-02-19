///////////////buffer conversion helpers functions/////
module.exports = {
  convertHexArrayToByteArray(hexarray, transformIntoArray = false) {
    //https://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript
    //converts an array/buffer of hex into numeric
    //this is a lot easier to manipulate
    var output = hexarray.map(function(element) {
      return parseInt(element, 16);
    });
    //if transform into a array, converts to a standard array via [...output]
    return transformIntoArray === false ? output : [...output];
  },


  returnArrayFromBuffer(buffer) {
    //https://stackoverflow.com/questions/18148827/convert-buffer-to-array
    return Array.prototype.slice.call(buffer, 0);
    //or [...exampleBuffer]
  },

  hasHeader(message) {
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
  },


  stripMessageOfHeaderAndChecksum(message) {
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
      // console.log (message);
      // throw new Error ('Error No Start (165) byte the Message');
      StartOfMessege = 0;
    }
    var strippedMessage = message.slice (StartOfMessege, message.length - 2); //removes the high and low checksum bytes in back and the HEADER

    return buffer === true ? Buffer.from (strippedMessage) : strippedMessage;
  },

  /////////////////////// helper Functions  //////
  sumOfBytes(message) {
    var sum = message.reduce((accumulator, element)=>{
      return accumulator + element;
    }, 0);
    return sum;
  },

  returnHighBit(value) {
    return parseInt(value / 256);
  },

  returnLowBit (value) {
    return value % 256;
  },

  combineHighPlusLowBit(highBit, lowBit) {
    //returns the checksum, calculated from the high Bit and Low bit
    return highBit * 256 + lowBit;
  },

  appendCheckSum(packet) {
    //appends the
    var checksum = module.exports.sumOfBytes(packet);
    var highAndLowBitArray = [];

    highAndLowBitArray.push(module.exports.returnHighBit(checksum));
    highAndLowBitArray.push(module.exports.returnLowBit(checksum));
    return packet.concat(highAndLowBitArray);
  },

  addOnHeaderToPacket(packet) {
    return [255, 0, 255].concat(packet);
  },

  preparePacketForSending(packet) {
    //prepares a packet ie: [2,4,3,2] for sending by adding a header and checksum high & lowbit
    var clonePacket = packet.slice();
    clonePacket = module.exports.appendCheckSum (clonePacket);
    clonePacket = module.exports.addOnHeaderToPacket (clonePacket);
    return clonePacket;
  },

  returnHighAndLowBitOfChecksum(message) {
    //returns an array [highBit, lowBit] calculated by taking the sum of the message
    var checksum = module.exports.sumOfBytes(message);
    var checksumLargeandSmallBit = [module.exports.returnHighBit (checksum), module.exports.returnLowBit (checksum)];
    return checksumLargeandSmallBit;
  },


  parsePumpStatus(data) {
    if (hasHeader(data) === true) {
      try {
        data = module.exports.stripMessageOfHeaderAndChecksum (data);
      } catch (err) {
        console.log (err);
      }
    }
    //return an object with pump status
    //input a stripped array, NO BUFFER //may work with buffer, not tested
    //165,0,16,96,7,15,10,0,0,0,198,5,120,0,0,0,0,0,1,22,4
    var indexAdjust = 0;
    var pumpData = {
      destination:  data[2],
      source:       data[3],
      action:       data[4],
      length:       data[5],
      state:        data[6], //4= off, 10 = on //power i think
      driveState:   data[7],
      ppc:          data[8],
      wattHighBit:  data[9],
      wattLowBit:   data[10],
      rpmHighBit:   data[11],
      rpmLowBit:    data[12],
      unknown1:     data[13],
      unknown2:     data[14],
      unknown3:     data[15],
      unknown4:     data[16],
      timerHighBit: data[17],
      timerLowBit:  data[18],
      timeHours:    data[19],
      timeMin:      data[20]
    };

    pumpData.watt = module.exports.combineHighPlusLowBit(pumpData.wattHighBit, pumpData.wattLowBit );
    pumpData.rpm = module.exports.combineHighPlusLowBit(pumpData.rpmHighBit, pumpData.rpmLowBit );
    pumpData.timer = pumpData.timerHighBit + ':' + pumpData.timerLowBit;
    pumpData.timeCurrent = pumpData.timeHours + ':' + pumpData.timeMin;

    return pumpData;
  },

  flipSourceAndDestinationFromStrippedMessage(buffer) {
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
  },

  processBufferMessage(message) {
    message = module.exports.convertToDecArray(message);
    return module.exports.stripMessageOfHeaderAndChecksum(message);
  },


  convertToDecArray(bufferArray) {
    return [... bufferArray];
    // .map((element) => {
    //   return parseInt(element, 16);
    // });
  },

  isStatusMessage(message) {
    if (message[4] === 7) {
      return true;
    }
    return false;
  }
};
// // module.exports.acknowledgment = acknowledgment;
// module.exports = {
//   appendCheckSum,
//   addOnHeaderToPacket,
//   combineHighPlusLowBit,
//   convertToDecArray,
//   convertHexArrayToByteArray,
//   flipSourceAndDestinationFromStrippedMessage,
//   hasHeader,
//   isStatusMessage,
//   returnLowBit,
//   returnHighAndLowBitOfChecksum,
//   returnHighBit,
//   parsePumpStatus,
//   preparePacketForSending,
//   processBufferMessage,
//   stripMessageOfHeaderAndChecksum,
//   sumOfBytes,
// };