
var flipSourceAndDestinationFromStrippedMessage = require('./pump/helperFunctions').flipSourceAndDestinationFromStrippedMessage;
exports.exteralTimer;
exports.statusRequestUpdateInverval = 500; //controls how often pump status are sent
exports.showPumpStatusInConsole = false;



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