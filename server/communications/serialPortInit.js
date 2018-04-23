// var sp = require(process.env.NODE_PATH + '/server/serialPort');
const configureFile = require(process.env.NODE_PATH + '/server/configureFile').config;
const logger = require (process.env.NODE_PATH + '/server/logging/winston').sendToLogs;
const Promise = require('bluebird');
const processIncomingSerialPortData = require(process.env.NODE_PATH + '/server/communications/serialPort.js').processIncomingSerialPortData;


module.exports.init = async function (serialPortComData, logger, ) {
  const serialPaths = configureFile.system.communications && configureFile.system.communications.rs485;
  const sp = require(process.env.NODE_PATH + '/server/communications/serialPort.js');
  sp.setLogger(logger);
  // var waitTOFinish = sp.init(serialPaths, logger);

  var results = [];
  for (var port of serialPaths) {
    if (port.type === 'rs485') {
      results.push(sp.newSerialPort(port.name, port.hardwareAddress));
    }
  }
  results = await Promise.all(results);
  return sp;


  // sp.setGroupOfTriggers('/dev/ttyUSB0', {
  //   'data': processIncomingSerialPortData
  // });
};