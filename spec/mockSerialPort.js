//note currently causing problems when not exiting

// process.env.NODE_PATH = __dirname + '/../';
// var glob = require(process.env.NODE_PATH + '/requireGlob').init(['node_modules', 'spec', 'testingRandomStuff', 'public', 'logs']);

// const SerialPort = require('serialport/test');
// const MockBinding = SerialPort.Binding;
// const portPath = 'COM_ANYTHING';
// const helperFunctions = require (process.env.NODE_PATH + '/server/equipment/pentair/helperFunctions.js');

// MockBinding.createPort(portPath, { echo: false, record: false });

// var lastMockInfo;
// port = module.exports = new SerialPort(portPath);

// // port.on('open', () => {
// //   // To pretend to receive data (only works on open ports)
// //   port.binding.emitData(Buffer.from('Hi from my test!'));
// // });
// // log received data
// // port.on('data', (data) => {
// //   console.log('Received:\t', data.toString('utf8'));
// //   console.log('crazy');
// // });

// var mockPortTimer = setInterval (() => {
//   var data = port.binding.lastWrite;
//   if (lastMockInfo === data) {
//     return;
//   } else {
//     lastMockInfo = data;
//     if (!data) { return; }
//     data = helperFunctions.convertToDecArray (data);
//     var postitionOfStartHeader = data.indexOf(165);
//     // console.log ('Mock Data Received: ', data);
//     flipDataInArray(data, postitionOfStartHeader + 2, postitionOfStartHeader + 3);
//     // console.log ('Mock Data Returned: ', data);
//     //must process data here
//     port.binding.emitData(Buffer.from(data));

//   }
// }, 10);

// var flipDataInArray = function (array, pos1, pos2) {
//   if (!Array.isArray(array) || typeof pos1 !== 'number' || typeof pos2 !== 'number') {
//     return;
//   }
//   if (array.length < pos1 || array.length < pos2) { return; }

//   var temp = array[pos1];
//   array[pos1] = array[pos2];
//   array[pos2] = temp;
//   return array;
// };


// // /* eslint-disable node/no-missing-require */
// // 'use strict';

// // // Load Serialport with mock bindings
// // // const SerialPort = require('../test'); // from inside the serialport repo
// // const SerialPort = require('serialport/test'); // when installed as a package
// // const MockBinding = SerialPort.Binding;

// // const portPath = 'COM_ANYTHING';

// // // The mock bindings can pretend to be an arduino with the `arduinoEcho` program loaded.
// // // This will echo any byte written to the port and will emit "READY" data after opening.
// // // You enable this by passing `echo: true`

// // // Another additional option is `record`, if `record: true` is present all
// // // writes will be recorded into a single buffer for the lifetime of the port
// // // it can be read from `port.binding.recording`.

// // // Create a port
// // MockBinding.createPort(portPath, { echo: false, record: false });

// // const port = new SerialPort(portPath);
// // port.on('open', () => {
// //   console.log('Port opened:\t', port.path);
// // });

// // // Write data and confirm it was written
// // const message = Buffer.from('Lets write data!');
// // port.write(message, () => {
// //   console.log('Write:\t\t Complete!');
// //   console.log('Last write:\t', port.binding.lastWrite.toString('utf8'));
// // });

// // // log received data
// // port.on('data', (data) => {
// //   console.log('Received:\t', data.toString('utf8'));
// // });

// // port.on('open', () => {
// //   // To pretend to receive data (only works on open ports)
// //   port.binding.emitData(Buffer.from('Hi from my test!'));
// // });

// // // When you're done you can destroy all ports with
// // MockBinding.reset();