var SerialPort = require('serialport');
var ports = module.exports.ports = {};
var logger = () => {};

var setPortPromise = function (err, data) {
  return new Promise ((resolve, revoke) => {
    if (err) {
      logger('system', 'warn', name + ': Serial Port Was Not Created' + err);
      revoke(err);
    } else {
      logger('system', 'info', name + ': Serial Port Created');
      resolve();
    }
  });
};


var init = exports.init = function (ports = [], newLogger = logger) {
  //////// server, serial Port Functions //////////////////////
  module.exports.setLogger(newLogger);
  // if (logger !== newLogger && typeof newLogger === 'function') { logger = newLogger; }

  for (var port of ports) {
    if (typeof port === 'string') {
      module.exports.ports[port] = new SerialPort(name, function (err) {
        if (err) {
          logger('system', 'warn', name + ': Serial Port Was Not Created' + err);
        } else {
          logger('system', 'info', name + ': Serial Port Created');
        }
      });
    } else if (typeof port === 'object') {
      let newPort = new SerialPort(port.hardwareAddress, function (err) {
        if (err) {
          logger('system', 'warn', port.name + ': Serial Port Was Not Created' + err);
        } else {
          logger('system', 'info', port.name + ': Serial Port Created');
        }
      });
      module.exports.ports[port.hardwareAddress] = newPort;
      if (port.hasOwnProperty('name')) {
        module.exports.ports[port.name] = newPort;
      } else {
        logger('system', 'warn', port.name + ': is missing either a property: Name');
      }
      if (port.hasOwnProperty('triggers')) {
        var keys = Object.keys (port.tiggers);
        for (var key of keys) {
          module.exports.setTrigger(port.name, key, port.triggers[key]);
          logger('system', 'debug', port.name + ': trigger set');
        }
      } else {
        logger('system', 'debug', port.name + ': is missing a property: triggers');
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

module.exports.returnPortByName = function (portName) {
  if (!!ports[portName]) {
    return ports[portName];
  } else {
    return null;
  }
};

module.exports.sendData = function (portName, message) {
  return new Promise ((resolve, revoke) => {
    var port = module.exports.returnPortByName(portName);
    port.pause();
    port.write(Buffer.from(message.packet), function (err) {
      if (err) {
        logger('events', 'error', 'sendData: Error writing' + message.outputInfo + ' to serialPort:' + err);
        revoke(err);
      }
      logger('events', message.logLevel, 'sendData: Success writing ' + message.outputInfo + ' to serialPort');
      resolve();
    });
    port.resume();
  });
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
    logger('system', 'info', 'setTrigger for Serial Port: ' + portName + ' now Set');
    ports[portName].on(trigger, callback);
  }
};

module.exports.setGroupOfTriggers = function (portName, triggers = {}) {
  ports;
  if (!ports[portName]) {
    logger('system', 'warn', 'Error: Set Triggers for Serial Port: ' + portName + ' does not exist');
  } else {
    let keys = Object.keys(triggers);
    for (var key of keys) {
      ports[portName].on(key, triggers[key]);
    }
    logger('system', 'info', 'setGroupOfTriggers for Serial Port: ' + portName + ' now Set');
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