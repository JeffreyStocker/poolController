var io = require ('socket.io');
// var defaultMsg = require (process.env.NODE_PATH + '/server/preBuiltMessages.js');
var logger = require (process.env.NODE_PATH + '/server/logging/winston').sendToLogs;
var socketServer = require (process.env.NODE_PATH + '/server/server').socketServer;
var { addToQueue } = require (process.env.NODE_PATH + '/server/equipment/pentair/queue');
var { statusRequestUpdateInverval, exteralTimer, statusTimers, timerIntellicom } = require(process.env.NODE_PATH + '/server/variables');
var { pumpData, port } = require (process.env.NODE_PATH + '/server/communications/serialPort');
// const {  } = require (process.env.NODE_PATH + '/server/pump/helperFunctions.js');
var Message = require (process.env.NODE_PATH + '/server/equipment/pentair/PentairMessages');
var {
  manualPumpControl,
  pumpControlPanelState,
  pumpPower,
  runIntellicomPumpSpeed,
  runPumpAtSpeed,
  setPumpTimer,
  runPumpProgram
} = require (process.env.NODE_PATH + '/server/equipment/pentair/pentairPumpCommands.js');


var createMessage = function (message, name, logLevel = 'info', messageCallback = ()=>{}) {
  return new Message (message, name, {logLevel}, messageCallback);
};


var sendMessage = function (queue, queueName, message, options = {}, callback = ()=>{}) {
  var response = queue.addMessageToQueue (queueName, message, null, (err, data) => {
    if (err) {

    } else {
      logger('events', 'info', data.name + 'was sent to:' + queueName);
      callback(0);
    }
  });
};


var temp = function () {
  var message = createMessage();
};

var endMessage = function () {

};


socketServer.on('connection', function (socket) { // WebSocket Connection
  logger('event', 'verbose', 'socket connected:' + socket.id);

  socket.on('Trial_intellicom', function (speed, callback) {
    var message = new Message (defaultMsg.pumpToLocal, 'Trial_intellicom, pumpToLocal', null, callback);

  });

  socket.on('manualPacket', function (message, callback) {
    logger('events', 'info', 'emitting: ' + message);
    message = Message.prototype.prepareMessageForSending(message);

    logger('events', 'info', 'emitting: ' + message);
    port.write(message, function(err) {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
      logger('event', 'verbose', 'Sent Command:', ': [' + [...message] + ']');
    });
    callback(0);
  });

  socket.on ('pumpDataForceUpdate', function (callback) {
    logger('event', 'debug', 'pump data requested and Pump Information');

    addToQueue (pumpGetStatus);
    socket.emit('pumpDataReturn', pumpData);
    // socket.emit('confirm');
    callback(0);
  });

  socket.on ('pumpData', function (callback) {
    // logger.debug('pumpData');
    socket.emit('pumpDataReturn', pumpData);
    callback(0);
  });


  socket.on('pump off', function(callback) {
    // logger.debug('pump off');
    clearInterval(exteralTimer); //clear external timers
    clearInterval(timerIntellicom);
    // addToQueue(pumpToRemote);
    addToQueue(pump_Off);
    // addToQueue(pumpToLocal);
    // socket.emit('confirm');
    callback(0);
  });


  socket.on('intellicom', function (speed, callback) {
    // logger.debug('intellicom');
    runIntellicomPumpSpeed(speed);
    // socket.emit('confirm');
    callback(0);
  });


  socket.on ('test_runpumpSpeedAt1000RPM', function () {
    // logger.debug('test_runpumpSpeedAt1000RPM');
    addToQueue ([ 165, 0, 96, 33, 1, 4, 2, 196, 3, 232 ]);
    // socket.emit('confirm');
  });


  socket.on('runSpeed', function (speed, callback) {
    console.log ('run speed', speed);
    runPumpProgram(speed, undefined, undefined, (err, val) => {
      if (err) {
        callback (err, null);
      } else {
        callback(0);
      }
    });
  });


  socket.on('setPumpExternalspeed', function (speed, callback) {
    // logger.debug('setPumpExternalspeed');
    runIntellicomPumpSpeed(speed);
    // socket.emit('confirm');
    callback(0);
  });


  socket.on ('pumpPower', function (powerState, callback) {
    // logger.debug('pumpPower');
    pumpPower(powerState);
    // socket.emit('confirm');
    callback(0);
  });


  socket.on ('runPumpAtSpeed', function (rpm, callback) {
    // logger.debug('runPumpAtSpeed');
    runPumpAtSpeed(rpm);
    // socket.emit('confirm');
    callback(0);
  });


  socket.on ('setPumpTimer', function (time, callback) {
    // logger.debug('setPumpTimer');
    setPumpTimer(time);
    // socket.emit('confirm');
    callback(0);
  });


  socket.on ('manualPumpControl', function (time, callback) {
    // logger.debug('manualPumpControl');
    manualPumpControl(time);
    // socket.emit('confirm');
    callback(0);
  });


  socket.on ('pumpControlPanelState', function (state, callback) {
    pumpControlPanelState(state);
    callback(0);
  });

  socket.on ('pumpControlSetToLocalOverride', function (state, callback) {
    let packet = Buffer.from([165, 0, 96, 16, 4, 1, 0, 1, 26, 1, 53]); //adds header, checksum and converts to a buffer

    port.write(packet, function(err) {
      if (err) {
        console.log('Error on write: ', err.message);
      }
    });
  });


  var pumpGetStatus = true;

  socket.on ('toggleStatusUpdate', function (state, callback) {
    // logger.debug('toggleStatusUpdate');
    if (pumpGetStatus) {
      clearInterval (statusTimers);
    } else {
      addToQueue(pumpGetStatus);
      statusTimers = setInterval(()=> {
        addToQueue(pumpGetStatus);
      }, statusRequestUpdateInverval); //gets pump status once every mintute  statusRequestUpdateInverval
    }
    pumpGetStatus = !pumpGetStatus;
    // socket.emit('confirm');
    // callback(0);
  });
});



socketServer.on ('disconnect', function (socket) {
  logger('event', 'verbose', 'socket disconnected: ' + socket.id);
});
