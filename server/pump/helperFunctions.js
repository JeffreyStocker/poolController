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
    state:        data[6], //4= off, 10 = on //power i think
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

module.exports.acknowledgment = acknowledgment;
module.exports.appendCheckSum = appendCheckSum;
module.exports.addOnHeaderToPacket = addOnHeaderToPacket;
module.exports.combineHighPlusLowBit = combineHighPlusLowBit;
module.exports.convertToDecArray = convertToDecArray;
module.exports.convertHexArrayToByteArray = convertHexArrayToByteArray;
module.exports.flipSourceAndDestinationFromStrippedMessage = flipSourceAndDestinationFromStrippedMessage;
module.exports.hasHeader = hasHeader;
module.exports.preparePacketForSending = preparePacketForSending;
module.exports.returnLowBit = returnLowBit;
module.exports.returnHighAndLowBitOfChecksum = returnHighAndLowBitOfChecksum;
module.exports.returnHighBit = returnHighBit;
module.exports.parsePumpStatus = parsePumpStatus;
module.exports.stripMessageOfHeaderAndChecksum = stripMessageOfHeaderAndChecksum;
module.exports.sumOfBytes = sumOfBytes;