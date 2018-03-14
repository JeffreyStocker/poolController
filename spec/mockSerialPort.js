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