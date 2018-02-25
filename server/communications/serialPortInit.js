// var sp = require(process.env.NODE_PATH + '/server/serialPort_modular');
var configureFile = require(process.env.NODE_PATH + '/server/configureFile').config;
var logger = require (process.env.NODE_PATH + '/server/logging/winston').sendToLogs;
const { convertToDecArray, parsePumpStatus, isStatusMessage } = require(process.env.NODE_PATH + '/server/equipment/pentair/helperFunctions.js');

var processIncomingSerialPortData = require(process.env.NODE_PATH + '/server/communications/serialPort.js').processIncomingSerialPortData;

module.exports.init = function () {
  var serialPaths = configureFile.system.communications && configureFile.system.communications.rs485;
  var sp = require(process.env.NODE_PATH + '/server/communications/serialPort_modular.js');
  var waitTOFinish = sp.init(serialPaths, logger);
  // sp.setGroupOfTriggers('/dev/ttyUSB0', {
  //   'data': processIncomingSerialPortData
  // });
  return sp;
};