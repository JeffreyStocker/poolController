var SerialPort = require('serialport');
var ports = module.exports.ports = {};
var logger = () => {};

var init = exports.init = function (portNames = [], newLogger = logger) {
  //////// server, serial Port Functions //////////////////////
  module.exports.setLogger(newLogger);
  // if (logger !== newLogger && typeof newLogger === 'function') { logger = newLogger; }

  for (var name of portNames) {
    if (typeof name === 'string') {
      ports[name] = new SerialPort(name, function (err) {
        if (err) {
          logger('system', 'warn', name + ': Serial Port Was Not Created' + err);
        } else {
          logger('system', 'info', name + ': Serial Port Created');
        }
      });
    } else if (typeof name === 'object') {
      let nameObj = name;
      if (nameObj.hasOwnProperty('name')) {
        ports[nameObj.name] = new SerialPort(nameObj.name, function (err) {
          if (err) {
            logger('system', 'warn', nameObj.name + ': Serial Port Was Not Created' + err);
          } else {
            logger('system', 'info', nameObj.name + ': Serial Port Created');
          }
        });
      } else {
        logger('system', 'warn', name + ': is missing either a property: Name');
      }
      if (nameObj.hasOwnProperty('triggers')) {
        var keys = Object.keys (nameObj.tiggers);
        for (var key of keys) {
          module.exports.setTrigger(nameObj.name, key, nameObj.triggers[key]);
        }
      } else {
        logger('system', 'warn', name + ': is missing a property: triggers');
      }
    }

    // Switches the port into 'flowing mode'
    // ports[name].on('data', function (data) {
    //   data = [... bufferArray];
    //   logger('system', 'verbose', name + ': Data Received | ' + data );
    // });
  }
  return module.exports;
};

module.exports.setLogger = function (newLogger = logger) {
  if (logger !== newLogger && typeof newLogger === 'function') {
    logger = newLogger;
  }
};

module.exports.setTrigger = function (portName, trigger, callback) {
  if (!ports.portName) {
    logger('system', 'warn', 'Error: setTrigger for Serial Port: ' + portName + ' does not exist');
  } else {
    ports[portName].on(trigger, callback);
  }
};

module.exports.setGroupOfTriggers = function (portName, triggers = {}) {
  if (!ports.portName) {
    logger('system', 'warn', 'Error: Set Triggers for Serial Port: ' + portName + ' does not exist');
  } else {
    let keys = Object.keys(triggers);
    for (var key of keys) {
      ports[portName].on(key, keys[key]);
    }
  }
};


module.exports.setPort = function (portName) {
  ports[portName] = new SerialPort(portName, function (err) {
    if (err) {
      logger('system', 'warn', ': Serial Port: ' + name + 'Was Not Created | ' + err);
    } else {
      logger('system', 'info', name + ': Serial Port Created');
    }
  });
};

module.exports.deletePort = function (portName) {
  if (!ports.portName) {
    logger('system', 'warn', 'Error: Delete Serial Port: ' + portName + ' does not exist');
  } else {
    logger('system', 'info', 'Deleted Serial Port: ' + portName);
    delete ports.portName;
  }
};