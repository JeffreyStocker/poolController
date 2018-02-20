var flipSourceAndDestinationFromStrippedMessage = require(process.env.NODE_PATH + '/server/equipment/pentair/helperFunctions.js').flipSourceAndDestinationFromStrippedMessage;
module.exports.exteralTimer;
module.exports.statusTimers;
module.exports.timerIntellicom;
module.exports.statusRequestUpdateInverval = 500; //controls how often pump status are sent
module.exports.showPumpStatusInConsole = false;



var acknowledgment = module.exports.acknowledgment =
{
  // message:[],
  status: 'none',

  orginalMessage: undefined,
  missingMessageCount: 0,

  startTimeWait: undefined,
  nowTimeWait: undefined,

  isAcknowledgment: function (messageToCheck) {
    var originalByteArray = flipSourceAndDestinationFromStrippedMessage(this.orginalMessage.originalPacket);
    // console.log('orginalMessage: ' , originalByteArray.toString());
    // console.log('messageToCheck: ' , messageToCheck);
    if (originalByteArray.toString() === messageToCheck.toString()) {
      // console.log('IT IS TRUE!!!');
      return true;
    } else { return false; }
  },

  reset: function () {
    acknowledgment.status = 'none';
    acknowledgment.startTimeWait = 0;
    acknowledgment.nowTimeWait = 0;
    acknowledgment.orginalMessage = undefined;
    acknowledgment.missingMessageCount = 0;
  },
  resetTimers: function () {
    acknowledgment.startTimeWait = 0;
    acknowledgment.nowTimeWait = 0;

  },
  resetMessages: function () {
    acknowledgment.status = 'none';
    acknowledgment.orginalMessage = undefined;
    acknowledgment.missingMessageCount = 0;
  }

};

module.exports.addresses = {
  chlorinator: [2, 16], // 	Chlorinator (This is a different type of packet)
  broadcast: 15,
  pool_controller: 16, // 	Pool controller (EasyTouch, intellicom, et al)
  remoteWiredController: 32,
  remoteWirelessController: 34, 	//(Screen Logic, or any apps that connect to it, like this one)
  pump1: 96,
  pump2: 97,
  pump3: 98,
  pump4: 99,
  pump5: 100,
  pump6: 101,
  pump7: 102,
  pump8: 103,
  pump9: 104,
  pump10: 105,
  pump11: 106,
  pump12: 107,
  pump13: 108,
  pump14: 109,
  pump15: 110,
  pump16: 111,
};