// var http = require('http');
// var url = require('url');
// var fs = require('fs');
var express = require ('express');
var app = express();
var io = require ('socket.io');
var loggerSystem = require(process.env.NODE_PATH + '/server/logs/winston').loggers.system;
// var events = require('events');
// var pumpFunctions= require ('./pumpFunction.js')

var port = process.env.PORT = 8181;

app.use(express.static('public'));

var server = require('http').createServer(app);

exports.socketServer = io(server, {
  logger: {
    debug: loggerSystem.debug,
    info: loggerSystem.info,
    error: loggerSystem.error,
    warn: loggerSystem.warn
  }
});

exports.server = server;

server.listen(port, () => {
  loggerSystem.info('Server Listening on port: ', port);
  // console.log('Server Listening on port: ', port)
});


//sends command from shift
//need to figure out how to look for a specific sequence
// packetToLookFor
// var messagesRecieved=[]
// var queueMessagesToSend=[]
// port.resume()

// console.log('queueMessagesToSend.length: ' , queueMessagesToSend.length);
// if (queueMessagesToSend.length===1) {setTimeout(function (){
//   addStatusToQueue (pump)
// }), 1000}

//////////////////initial code to start the main sequence



// function exitSendCommand(){
//   // sendCommand(pumpToLocal)  //return pump to local command
//   port.write(pumpToLocal.packet, function(err) {
//     if (err) {
//       return console.log('Error on write: ', err.message);
//     }
//     console.log('Sent Command: ', pumpToLocal.name, ': ', pumpToLocal.packet);
//   });
//   console.log ('Pump Set to local')
// }


// process.on('SIGINT', function () { //on ctrl+c
//   // clearTimeout()  setTimeout (queueLoopMain, 100)


//   queueLoopMain(true)
//   exitSendCommand()  //exit sequence, should exit

//   //https://stackoverflow.com/questions/21864127/nodejs-process-hangs-on-exit-ctrlc
//   console.log('Nice SIGINT-handler');
//   var listeners = process.listeners('SIGINT');
//   for (var i = 0; i < listeners.length; i++) {
//       console.log(listeners[i].toString());
//   }

//   process.exit(); //exit completely
// });
