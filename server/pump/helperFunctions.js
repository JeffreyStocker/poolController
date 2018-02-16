///////////////buffer conversion helpers functions/////
var convertHexArrayToByteArray = function (hexarray, transformIntoArray = false) {
  //https://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript
  //converts an array/buffer of hex into numeric
  //this is a lot easier to manipulate
  var output = hexarray.map(function(element) {
    return parseInt(element, 16);
  });
  //if transform into a array, converts to a standard array via [...output]
  return transformIntoArray === false ? output : [...output];
};


var returnArrayFromBuffer = function (buffer) {
  //https://stackoverflow.com/questions/18148827/convert-buffer-to-array
  return Array.prototype.slice.call(buffer, 0);
  //or [...exampleBuffer]
};

var hasHeader = function (message) {
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
};


var stripMessageOfHeaderAndChecksum = function (message) {
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
};

/////////////////////// helper Functions  //////
var sumOfBytes = function (message) {
  var sum = message.reduce((accumulator, element)=>{
    return accumulator + element;
  }, 0);
  return sum;
};

var returnHighBit = function (value) {
  return parseInt(value / 256);
};

var returnLowBit = function (value) {
  return value % 256;
};

var combineHighPlusLowBit = function (highBit, lowBit) {
  //returns the checksum, calculated from the high Bit and Low bit
  return highBit * 256 + lowBit;
};

var appendCheckSum = function (packet) {
  //appends the
  var checksum = sumOfBytes(packet);
  var highAndLowBitArray = [];

  highAndLowBitArray.push(returnHighBit(checksum));
  highAndLowBitArray.push(returnLowBit(checksum));
  return packet.concat(highAndLowBitArray);
};

var addOnHeaderToPacket = function (packet) {
  return [255, 0, 255].concat(packet);
};

var preparePacketForSending = function (packet) {
  //prepares a packet ie: [2,4,3,2] for sending by adding a header and checksum high & lowbit
  var clonePacket = packet;
  clonePacket = appendCheckSum (clonePacket);
  clonePacket = addOnHeaderToPacket (clonePacket);
  return clonePacket;
};

var returnHighAndLowBitOfChecksum = function (message) {
  //returns an array [highBit, lowBit] calculated by taking the sum of the message
  var checksum = sumOfBytes(message);
  var checksumLargeandSmallBit = [returnHighBit (checksum), returnLowBit (checksum)];
  return checksumLargeandSmallBit;
};



var parsePumpStatus = function (data) {
  if (hasHeader(data) === true) {
    try {
      data = stripMessageOfHeaderAndChecksum (data);
    } catch (err) {
      console.log (err);
    }
  }


  //return an object with pump status
  //input a stripped array, NO BUFFER //may work with buffer, not tested
  //165,0,16,96,7,15,10,0,0,0,198,5,120,0,0,0,0,0,1,22,4
  var indexAdjust = 0;
  // var pumpData = {
  //   destination:  data[2],
  //   source:       data[3],
  //   action:       data[4],
  //   length:       data[5],
  //   state:        data[6], //4= off, 10 = on //power i think
  //   driveState:   data[7],
  //   ppc:          data[8],
  //   wattHighBit:  data[9],
  //   wattLowBit:   data[10],
  //   rpmHighBit:   data[11],
  //   rpmLowBit:    data[12],
  //   timerHighBit: data[15],
  //   timerLowBit:  data[18],
  //   timeHours:    data[19],
  //   timeMin:      data[20]
  // };

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

  pumpData.watt = combineHighPlusLowBit(pumpData.wattHighBit, pumpData.wattLowBit );
  pumpData.rpm = combineHighPlusLowBit(pumpData.rpmHighBit, pumpData.rpmLowBit );
  pumpData.timer = pumpData.timerHighBit + ':' + pumpData.timerLowBit;
  pumpData.timeCurrent = pumpData.timeHours + ':' + pumpData.timeMin;

  return pumpData;
};

var flipSourceAndDestinationFromStrippedMessage = function (buffer) {
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
};


var convertToDecArray = function (bufferArray) {
  var output = [... bufferArray];
  // .map((element) => {
  //   return parseInt(element, 16);
  // });
  return stripMessageOfHeaderAndChecksum(output);
};

var isStatusMessage = function (message) {
  if (message[4] === 7) {
    return true;
  }
  return false;
};

// module.exports.acknowledgment = acknowledgment;
module.exports = {
  appendCheckSum,
  addOnHeaderToPacket,
  combineHighPlusLowBit,
  convertToDecArray,
  convertHexArrayToByteArray,
  flipSourceAndDestinationFromStrippedMessage,
  hasHeader,
  isStatusMessage,
  preparePacketForSending,
  returnLowBit,
  returnHighAndLowBitOfChecksum,
  returnHighBit,
  parsePumpStatus,
  stripMessageOfHeaderAndChecksum,
  sumOfBytes,
};