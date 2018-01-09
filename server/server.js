var http = require('http');
var url = require('url');
var fs = require('fs');
var express = require ('express');
var app = express();
// var events = require('events');
// var pumpFunctions= require ('./pumpFunction.js')

var showPumpStatusInConsole=false;
var messagesReceived=[];
var queueMessagesToSend=[];
var queueLoopMain_InUse=false;


var exteralTimer;
var port;
var pumpData;
var statusRequestUpdateInverval = 500 ; //controls how often pump status are sent
var timeBetweenQueueSending = 250;  //intervel beteen when the queue sends off another message


// var server = http.createServer(function (req, res) {
//   var urlPath = url.parse(req.url, true);

//   //if the folder is blank, direct it to the index.html of that folder
//   if (urlPath.pathname[urlPath.pathname.length-1] === "/") {urlPath.pathname+='index.html'}


//   //directs the files to look in public/www for the html files rather than the base folder
//   //use '.' urlPath.pathname to direct to the base folder
//   // var mainDirectory= "./public/www/"
//   var mainDirectory= "./"
//   var filename = mainDirectory + urlPath.pathname;

//   fs.readFile(filename, function(err, data) {
//     if (err) {
//       res.writeHead(404, {'Content-Type': 'text/html'});
//       return res.end("404 Not Found");
//     }
//     // res.writeHead(200, {'Content-Type': 'text/html'}); //comment this out and it lets the web browser decide on type
//     res.write(data);
//     return res.end();
//   });
// }).listen(8181,function() {
//     console.log('Listening at: http://localhost:8181');
// });

app.use(express.static('../public'));

var server = app.listen(port, () => console.log('Server Listening on port: ', port) );




 //sends command from shift
  //need to figure out how to look for a specific sequence
  // packetToLookFor
  // var messagesRecieved=[]
  // var queueMessagesToSend=[]
  // port.resume()

  // console.log("queueMessagesToSend.length: " , queueMessagesToSend.length);
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
//   console.log ("Pump Set to local")
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
