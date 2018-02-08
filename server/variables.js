
var flipSourceAndDestinationFromStrippedMessage = require('./pump/helperFunctions').flipSourceAndDestinationFromStrippedMessage;
module.exports.exteralTimer;
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
    var originalByteArray = flipSourceAndDestinationFromStrippedMessage(this.orginalMessage.byte);
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