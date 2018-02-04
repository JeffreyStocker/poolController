var fs = require('fs');
var config = {};
var configFileLocation = './confisg.json';
var logs = [];

var defaults =
  {
    system: {
      web: {
        port: 8181
      },
      queue: {
        mainLoopInterval: 25,
        numberOfRetriesForMissingMessages: 3,
        statusRequestUpdateInverval: 500,
        timeBetweenQueueSending: 250

      },
      logs: {
        system: {
          console: {
            colorize: true,
            label: 'system',
            level: 'debug',
          },
          file: {
            filename: '/server/logs/system.log'
          }
        },
        events: {
          console: {
            colorize: true,
            label: 'events',
            level: 'info',
          },
          file: {
            filename: '/server/logs/events.log'
          }
        },
        pump: {
          console: {
            colorize: true,
            label: 'pump',
            level: 'info',
          },
          file: {
            filename: '/server/logs/power.log'
          }
        },
      },
      communications: {
        rs485: {
          port: '/dev/ttyUSB0'
        },
        GPIO: {
        }
      },
    },
    equipment: {
      pumps: {
        1: {
          enabled: true,
          name: 'pump 1',
          communications: {
            type: 'rs485',
            address: 96,
          }
        }
      },
      controllers: {
        'intellicom': {
          'enabled': true,
          'name': ''
        },
        'intellitouch': {
          'enabled': false,
          'name': ''
        }
      }
    }
  };


  // module.exports.config = module.exports.init();
module.exports.config = {};


var parseConfig = function (json, callback) {
  var parsedInfo;
  try {
    parsedInfo = JSON.parse(json);
    return parsedInfo;
  } catch (err) {
    throw err;
  }
};


module.exports.init = function (location = configFileLocation, useDefault = false) {
  var data;
  if (Object.keys(config).length !== 0) { return config; }
  if (location === 'default' || useDefault === true) {
    data = defaults;
    logs.push('Using Default Configuration');
  }
  else {
    try {
      data = fs.readFileSync(location, 'utf8');
      data = parseConfig(data);
      logs.push('location');
    } catch (err) {
      data = defaults;
      console.log ('User Config File not found. Using Defaults Configuration');
      logs.push('User Config File not found. Using Default Configuration');
    }
  }
  Object.assign(module.exports.config, data);
  return module.exports;
};

module.exports.initLogging = function (loggerName, loggers) {
  if (!loggers[loggerName]) { return new Error ('Logger Missing from initLogging'); }

  var logger = loggers[loggerName];
  logs.forEach(log => {
    logger.info(log);
  });
  logs = function (newLog) {
    logger.info(newLog);
  };
};


module.exports.resultsForLogger = function () {
  return logger;
};


module.exports.loadConfig = function () {
  fs.readFile(configFileLocation, 'utf8', (err, data) => {
    if (err) {
    } else {
      parseConfig(data, function (err, data) {
        if (err) {
          console.log ('Error Processing Config File', err);
        } else {
          module.exports.config = data;
        }
      });
    }
  });
};


module.exports.saveConfig = function () {
  fs.writeFile(configFileLocation, JSON.stringify(config, null, 2), 'utf8', (err) => {
    if (err) {
      console.log ('Error writing config file', err);
    } else {
      // console.log ('Success writing config file');
    }
  });
};

module.exports.loadDefault = function () {
  config = defaults;
};


module.exports.resetDefault = function () {
  module.exports.loadDefault();
  module.exports.saveConfig();
};



// module.exports.init();
// module.exports.loadDefault();
// module.exports.saveConfig()
// module.exports.config = get config();
// Object.defineProperty(module.exports, 'config', {
//   get: function() { return config; }
// });

