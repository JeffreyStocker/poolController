var io = require ("socket.io")
const { addToQueue } = require ('./queue')
const { 
  manualPumpControl,
  pumpControlPanelState,
  pumpPower, 
  runIntellicomPumpSpeed,
  runPumpAtSpeed,
  setPumpTimer,
} = require ('./commands')
const {server} = require ('../server');
var pushPumpInfoToWebPages;

io.listen(server).on('connection', function (socket) {// WebSocket Connection

  pushPumpInfoToWebPages = function pushPumpInfoToWebPages (){
    socket.emit('pumpDataReturn', pumpData)
  }

  socket.on ('pumpDataForceUpdate', function (){
    console.log ("pump data requested and Pump Information")
    addToQueue (pumpGetStatus)
    socket.emit('pumpDataReturn', pumpData)
  })

  socket.on ('pumpData', function (){
    console.log ("pump data requested")
    socket.emit('pumpDataReturn', pumpData)
  })

  socket.on('pump off', function() {
    clearInterval(exteralTimer) //clear external timers
    // addToQueue(pumpToRemote)
    addToQueue(pump_Off)
    // addToQueue(pumpToLocal)
  });

  socket.on('intellicom', function (speed){
    runIntellicomPumpSpeed(speed);
  })

  socket.on ('test_runpumpSpeedAt1000RPM', function () {
    addToQueue ([ 165, 0, 96, 33, 1, 4, 2, 196, 3, 232 ])
  })

  socket.on('setPumpExternalspeed', function (speed){
    runIntellicomPumpSpeed(speed)
  })

  socket.on ("pumpPower", function (powerState){
    pumpPower(powerState)
  })

  socket.on ("runPumpAtSpeed", function (rpm){
    runPumpAtSpeed(rpm)
  })

  socket.on ("setPumpTimer", function (time){
    setPumpTimer(time)
  })

  socket.on ("manualPumpControl", function (time){
    manualPumpControl(time)
  })

  socket.on ("pumpControlPanelState", function (state){
    pumpControlPanelState(state)
  })









  socket.on ("toggleStatusUpdate", function (state){
    if (pumpGetStatus) {
      clearInterval (exteralTimer)
    }
    else {
      addToQueue(pumpGetStatus)
      exteralTimer = setInterval(()=> {
        addToQueue(pumpGetStatus)
      }, statusRequestUpdateInverval) //gets pump status once every mintute  statusRequestUpdateInverval
    }
  })
});
