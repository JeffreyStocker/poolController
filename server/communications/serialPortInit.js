// var sp = require(process.env.NODE_PATH + '/server/serialPort_modular');
var configureFile = require(process.env.NODE_PATH + '/server/configureFile').config;
var logger = require (process.env.NODE_PATH + '/server/logging/winston').sendToLogs;
const { convertToDecArray, parsePumpStatus, isStatusMessage } = require(process.env.NODE_PATH + '/server/pump/helperFunctions.js');

var processIncomingSerialPortData = require(process.env.NODE_PATH + '/server/serialPort.js').processIncomingSerialPortData;

module.exports.init = function () {
  var serialPaths = configureFile.system.communications && configureFile.system.communications.rs485.ports;
  var sp = require(process.env.NODE_PATH + '/server/serialPort_modular.js');
  sp.init(serialPaths, logger);
  sp.setGroupOfTriggers('pump1', {
    'data': processIncomingSerialPortData
  });
};