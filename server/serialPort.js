const os = require('os'); //to get os version so i can install some testings
const { pushPumpInfoToWebPages } = require (process.env.NODE_PATH + '/server/communications/outgoingSocketIO');
const { convertToDecArray, parsePumpStatus } = require(process.env.NODE_PATH + '/server/pump/helperFunctions.js');
var { showPumpStatusInConsole, acknowledgment } = require(process.env.NODE_PATH + '/server/variables');
var socketServer = require (process.env.NODE_PATH + '/server/server.js').socketServer;
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
    // console.log ('data', data)
    data = convertToDecArray (data);
    if (data[4] === 7) {
      var pumpData = parsePumpStatus(data);
      if (showPumpStatusInConsole) { console.log('Data Received:  [' + [... data] + ']'); }
      // console.log ('Pump Data Updated')
      try {
        // pushPumpInfoToWebPages(pumpData);
        // console.log (socketServer.emit)
        socketServer.emit('pumpDataReturn', pumpData);
      } catch (err) {
        // console.log ('Error: Port:On: pushPUmpInfoToWebPages is not working')
        logger('system', 'error', 'Error proccesing data' + err);
        // console.log ('err: ', err);
        // console.log('Status Received:  [' + [... data] + ']');
      }
      acknowledgment.status = 'found';
    } else if (acknowledgment.status === 'waiting For') {
      var check = acknowledgment.isAcknowledgment(data);
      acknowledgment.status = 'found';
      logger('events', 'verbose', 'Acknowledged:  [' + [... data] + ']');
      // console.log('Acknowledged:  [' + [... data] + ']');
      // acknowledgment.message.push(data);
      // acknowledgment.reset();
    } else if (Array.isArray(data) === false) {
      // console.log(data);
      logger('events', 'debug', 'Data raw: ' + data);

    } else {
      logger('events', 'verbose', 'Data Received:  [' + [... data] + ']');
    }

    // else if (acknowledgment.status !== 'waiting For' || acknowledgment.isAcknowledgment(data) !== true) {
    //   console.log ('not acknowledgment', data)
    // }

  });
};

init();