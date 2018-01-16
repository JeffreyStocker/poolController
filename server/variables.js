exports.exteralTimer;
exports.port;
exports.pumpData;
exports.statusRequestUpdateInverval = 500 ; //controls how often pump status are sent
exports.timeBetweenQueueSending = 250;  //intervel beteen when the queue sends off another message

exports.showPumpStatusInConsole=false;
exports.messagesReceived=[];
exports.queueMessagesToSend=[];
exports.queueLoopMain_InUse=false;