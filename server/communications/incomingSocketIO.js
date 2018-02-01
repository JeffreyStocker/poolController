var io = require ('socket.io');
var socketServer = require ('../server').socketServer;
const { addToQueue } = require ('../pump/queue');

// module.pushPumpInfoToWebPages = function pushPumpInfoToWebPages (){
//   socket.emit('pumpDataReturn', pumpData)
// }
const { server } = require ('../server');
var { statusRequestUpdateInverval, exteralTimer } = require('../variables');
var { pumpData } = require ('../serialPort');
const {
  manualPumpControl,
  pumpControlPanelState,
  pumpPower,
  runIntellicomPumpSpeed,
  runPumpAtSpeed,
  setPumpTimer,
} = require ('../pump/commands');



// // exports.pushPumpInfoToWebPages = pushPumpInfoToWebPages;
// io.listen(server).on('connection', function (socket) {// WebSocket Connection
//   module.pushPumpInfoToWebPages()
//   //  = function pushPumpInfoToWebPages (){
//   //   socket.emit('pumpDataReturn', pumpData)
//   // }
// });

// io.listen(server).on('connection', function (socket) {// WebSocket Connection

//   socket.on ('pumpDataForceUpdate', function (){
//     console.log ('pump data requested and Pump Information')
//     addToQueue (pumpGetStatus)
//     socket.emit('pumpDataReturn', pumpData)
//   })

//   socket.on ('pumpData', function (){
//     console.log ('pump data requested')
//     socket.emit('pumpDataReturn', pumpData)
//   })


//   socket.on('pump off', function() {
//     clearInterval(exteralTimer) //clear external timers
//     // addToQueue(pumpToRemote)
//     addToQueue(pump_Off)
//     // addToQueue(pumpToLocal)
//   });


//   socket.on('intellicom', function (speed){
//     runIntellicomPumpSpeed(speed);
//   })


//   socket.on ('test_runpumpSpeedAt1000RPM', function () {
//     addToQueue ([ 165, 0, 96, 33, 1, 4, 2, 196, 3, 232 ])
//   })


//   socket.on('setPumpExternalspeed', function (speed){
//     runIntellicomPumpSpeed(speed)
//   })


//   socket.on ('pumpPower', function (powerState){
//     pumpPower(powerState)
//   })


//   socket.on ('runPumpAtSpeed', function (rpm){
//     runPumpAtSpeed(rpm)
//   })


//   socket.on ('setPumpTimer', function (time){
//     setPumpTimer(time)
//   })


//   socket.on ('manualPumpControl', function (time){
//     manualPumpControl(time)
//   })


//   socket.on ('pumpControlPanelState', function (state){
//     pumpControlPanelState(state)
//   })


//   socket.on ('toggleStatusUpdate', function (state){
//     if (pumpGetStatus) {
//       clearInterval (exteralTimer)
//     }
//     else {
//       addToQueue(pumpGetStatus)
//       exteralTimer = setInterval(()=> {
//         addToQueue(pumpGetStatus)
//       }, statusRequestUpdateInverval) //gets pump status once every mintute  statusRequestUpdateInverval
//     }
//   })
// });
socketServer.on ('disconnect', function () {
  // console.log ('socket disconnected');
});


socketServer.on('connection', function (socket) { // WebSocket Connection
  console.log ('socket connected');

  socket.on ('pumpDataForceUpdate', function (callback) {
    console.log ('pump data requested and Pump Information');
    addToQueue (pumpGetStatus);
    socket.emit('pumpDataReturn', pumpData);
    // socket.emit('confirm');
    callback(0);
  });

  socket.on ('pumpData', function (callback) {
    console.log ('pump data requested');
    socket.emit('pumpDataReturn', pumpData);
    callback(0);
  });


  socket.on('pump off', function(callback) {
    clearInterval(exteralTimer); //clear external timers
    // addToQueue(pumpToRemote);
    addToQueue(pump_Off);
    // addToQueue(pumpToLocal);
    // socket.emit('confirm');
    callback(0);
  });


  socket.on('intellicom', function (speed, callback) {
    runIntellicomPumpSpeed(speed);
    // socket.emit('confirm');
    callback(0);
  });


  socket.on ('test_runpumpSpeedAt1000RPM', function () {
    addToQueue ([ 165, 0, 96, 33, 1, 4, 2, 196, 3, 232 ]);
    // socket.emit('confirm');
  });


  socket.on('setPumpExternalspeed', function (speed, callback) {
    runIntellicomPumpSpeed(speed);
    // socket.emit('confirm');
    callback(0);
  });


  socket.on ('pumpPower', function (powerState, callback) {
    pumpPower(powerState);
    // socket.emit('confirm');
    callback(0);
  });


  socket.on ('runPumpAtSpeed', function (rpm, callback) {
    runPumpAtSpeed(rpm);
    // socket.emit('confirm');
    callback(0);
  });


  socket.on ('setPumpTimer', function (time, callback) {
    setPumpTimer(time);
    // socket.emit('confirm');
    callback(0);
  });


  socket.on ('manualPumpControl', function (time, callback) {
    manualPumpControl(time);
    // socket.emit('confirm');
    callback(0);
  });


  socket.on ('pumpControlPanelState', function (state, callback) {
    pumpControlPanelState(state);
    // socket.emit('confirm');
    callback(0);
  });


  socket.on ('toggleStatusUpdate', function (state, callback) {
    if (pumpGetStatus) {
      clearInterval (exteralTimer);
    } else {
      addToQueue(pumpGetStatus);
      exteralTimer = setInterval(()=> {
        addToQueue(pumpGetStatus);
      }, statusRequestUpdateInverval); //gets pump status once every mintute  statusRequestUpdateInverval
    }
    // socket.emit('confirm');
    callback(0);
  });
});
