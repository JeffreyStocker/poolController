const os = require('os'); //to get os version so i can install some testings
const { pushPumpInfoToWebPages } = require (process.env.NODE_PATH + '/server/communications/outgoingSocketIO');
const { parsePumpStatus, isStatusMessage, processBufferMessage } = require(process.env.NODE_PATH + '/server/equipment/pentair/helperFunctions.js');
var { showPumpStatusInConsole, acknowledgment } = require(process.env.NODE_PATH + '/server/variables');
var socketServer = require (process.env.NODE_PATH + '/server/server.js').socketServer;
var queue = require (process.env.NODE_PATH + '/server/equipment/pentair/queue.js');
var logger = require (process.env.NODE_PATH + '/server/logging/winston').sendToLogs;


var port;
// var acknowledgment = require ('./messages');
var init = exports.init = function () {
  //////// server, serial Port Functions //////////////////////
  if (os.platform() === 'win32') {
    // const SerialPort = require('serialport/test');
    // const MockBinding = SerialPort.Binding;
    // const portPath = 'COM_ANYTHING';
    // MockBinding.createPort(portPath, { echo: false, record: false });
    // port = exports.port = new SerialPort(portPath);

    // port.on('open', () => {
    //   // To pretend to receive data (only works on open ports)
    //   port.binding.emitData(Buffer.from('Hi from my test!'));
    // });
    // // log received data
    // port.on('data', (data) => {
    //   console.log('Received:\t', data.toString('utf8'));
    //   console.log('crazy');

    // });
    // port.write('message', () => {
    //   console.log('Write:\t\t Complete!');
    //   console.log('Last write:\t', port.binding.lastWrite.toString('utf8'));
    // });

    port = exports.port = require (process.env.NODE_PATH + '/spec/mockSerialPort.js');
  } else {
    var SerialPort = require('serialport');
    port = exports.port = new SerialPort('/dev/ttyUSB0', function (err) {
      if (err) {
        return console.log('Error: ', err.message);
      }
      logger('system', 'info', 'Serial Port Created');
      // console.log ('Serial Port Created');
    });
  }

  // Switches the port into 'flowing mode'
  port.on('data', function (data) {
    processIncomingSerialPortData(data);
  });
};

init();

module.exports.processIncomingSerialPortData = processIncomingSerialPortData = function () {
  data = processBufferMessage (data);
  if (isStatusMessage(data)) {
    var pumpData = parsePumpStatus(data);
    if (showPumpStatusInConsole) { logger('events', 'verbose', 'Data Received:  [' + [... data] + ']'); }
    try {
      socketServer.emit('pumpDataReturn', pumpData);
    } catch (err) {
      logger('system', 'error', 'Error sending pump data via socketIO' + err);
    }
    acknowledgment.status = 'found';
  } else if (acknowledgment.status === 'waiting For') {
    var check = acknowledgment.isAcknowledgment(data);
    acknowledgment.status = 'found';
    logger('events', 'verbose', 'Acknowledged:  [' + [... data] + ']');
  } else if (Array.isArray(data) === false) {
    logger('events', 'debug', 'Data raw: ' + data);

  } else {
    logger('events', 'verbose', 'Data Received:  [' + [... data] + ']');
  }

  queue.queueLoopMain();

  // else if (acknowledgment.status !== 'waiting For' || acknowledgment.isAcknowledgment(data) !== true) {
  //   console.log ('not acknowledgment', data)
  // }
};