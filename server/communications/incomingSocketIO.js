const io = require ('socket.io');
const path = require('path');
const logger = require (process.env.NODE_PATH + '/server/logging/winston').sendToLogs;
const socketServer = require (process.env.NODE_PATH + '/server/server').socketServer;
const { /* pumpData, */ port } = require (process.env.NODE_PATH + '/server/communications/serialPort');
const Message = require (process.env.NODE_PATH + '/server/equipment/pentair/PentairMessages');
// const pumpLogger = require (process.env.NODE_PATH + '/server/logging/pentairPumpStatusLog.js');
const statusLogs = require(path.resolve(__dirname + '/../logging/CurrentLogs.js'));
const {convertToDateObject, returnEarlierDateFirst} = require ( __dirname + '/../../server/logging/databaseHelpers.js');

const {
  manualPumpControl,
  pumpControlPanelState,
  pumpPower,
  runIntellicomPumpSpeed,
  runPumpAtSpeed,
  setPumpTimer,
  runPumpProgram,
  runRepeatingStatus
} = require (process.env.NODE_PATH + '/server/equipment/pentair/pentairPumpCommands.js');


socketServer.on('connection', function (socket) { // WebSocket Connection
  logger('events', 'verbose', 'socket connected:' + socket.id);

  // socket.on('Trial_intellicom', function (speed, callback) {
  //   var message = new Message (defaultMsg.pumpToLocal, 'Trial_intellicom, pumpToLocal', null, callback);
  // });


  socket.on('manualPacket', function (message, queueName, callback) {
    message = Message.prototype.prepareMessageForSending(message);

    logger('events', 'info', 'emitting: ' + message);
    port.write(message, function(err) {
      if (err) {
        return console.log('Error on write: ', err.message);
        callback(err, null);
      } else {
        callback(null);
        logger('events', 'verbose', 'Sent Command:', ': [' + [...message] + ']');
      }
    });
  });


  // socket.on ('pumpDataForceUpdate', function (callback) {
  //   logger('events', 'debug', 'pump data requested and Pump Information');
  //   addToQueue (pumpGetStatus);
  //   socket.emit('pumpDataReturn', pumpData);
  //   callback(0);
  // });


  // socket.on ('pumpData', function (callback) {
  //   // logger.debug('pumpData');
  //   socket.emit('pumpDataReturn', pumpData);
  //   callback(0);
  // });


  socket.on('intellicom', function (speed, queueName, callback) {
    // logger.debug('intellicom');
    runIntellicomPumpSpeed(speed, queueName, callback);
  });


  // socket.on ('test_runpumpSpeedAt1000RPM', function () {
  //   // logger.debug('test_runpumpSpeedAt1000RPM');
  //   addToQueue ([ 165, 0, 96, 33, 1, 4, 2, 196, 3, 232 ]);
  //   // socket.emit('confirm');
  // });


  socket.on('runSpeed', function (speed, queueName, callback) {
    runPumpProgram(speed, undefined, undefined, callback);
  });


  socket.on('setPumpExternalspeed', function (speed, queueName, callback) {
    // logger.debug('setPumpExternalspeed');
    runIntellicomPumpSpeed(speed, callback);
    // socket.emit('confirm');
    // callback(0);
  });


  socket.on ('pumpPower', function (powerState, queueName, callback) {
    if (typeof arguments[arguments.length - 1] === 'function') {
      callback = arguments[arguments.length - 1];
      queueName = typeof queueName === 'function' ? 'pump1' : queueName;
    }

    (!queueName || typeof queueName !== 'string') && callback ('Must supply the equipment name and should be a string', null);

    // logger.debug('pumpPower');
    pumpPower(powerState, queueName, callback);
  });


  socket.on ('runPumpAtSpeed', function (rpm, queueName, callback) {
    // logger.debug('runPumpAtSpeed');
    runPumpAtSpeed(rpm, callback);
  });


  socket.on ('setPumpTimer', function (time, queueName, callback) {
    // logger.debug('setPumpTimer');
    setPumpTimer(time, callback);
  });


  socket.on ('manualPumpControl', function (time, queueName, callback) {
    // logger.debug('manualPumpControl');
    manualPumpControl(time, callback);
  });


  socket.on ('pumpControlPanelState', function (state, queueName, callback) {
    pumpControlPanelState(state, queueName, callback);
  });

  // socket.on ('pumpControlSetToLocalOverride', function (state, callback) {
  //   let packet = Buffer.from([165, 0, 96, 16, 4, 1, 0, 1, 26, 1, 53]); //adds header, checksum and converts to a buffer

  //   port.write(packet, function(err) {
  //     if (err) {
  //       console.log('Error on write: ', err.message);
  //       callback ('error with writing pumpControlSetToLocalOverride', null);
  //     } else {
  //       callback (null);
  //     }
  //   });
  // });

  socket.on('getPumpDataBetweenTime', function (time1, time2, pumpName, callback) {
    statusLogs.findBetweenCurrentAndPowerDatabase(time1, time2, pumpName)
      .then(results => {
        callback (null, results);
        // var data = results.map(currentDoc => {
        //   return { watt: currentDoc.watt, rpm: currentDoc.rpm, date: currentDoc._id };
        // });
        // callback (null, data);
      })
      .catch (err => {
        callback({message: err.message}, null);
      });
  });

  socket.on ('summaryaPumpData', function (date1, date2, callback = () => {}) {
    var date1 = convertToDateObject(date1);
    var date2 = convertToDateObject(date2);
    if (date1 === null || date2 === null) { callback ('Date1 and Date2 must be Dates'); }

    [date1, date2] = returnEarlierDateFirst(date1, date2);

    callback (null, data);
  });


  socket.on ('toggleStatusUpdate', function (state, queueName, callback = () => {}) {

    if (!state || typeof state !== 'string') {
      return callback ('toggleStatusUpdate requires a state and must be a string', null);
    } else if (!queueName || typeof queueName !== 'string') {
      return callback ('toggleStatusUpdate requires a queueName and must be a string', null);
    }

    runRepeatingStatus(state, callback);
  });


  socket.on ('test', function (...data) {
    var callback = data.pop();
    callback(null, data);
  });


  socket.on ('listEquipment', function (callback) {
    callback (null, [{name: 'Pump1', type: 'Pump'}]);
  });
});



socketServer.on ('disconnect', function (socket) {
  logger('event', 'verbose', 'socket disconnected: ' + socket.id);
});
