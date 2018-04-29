var fs = require('fs');
var config = {};
var configFileLocation = './config.json';
var logs = [];
var pretty = require ('jsonminify');
var hjson = require('hjson');
var logger = function (group, logLevel, message) {
  logs.push([group, logLevel, message]);
};

var defaultsFunction = function () {
  return {
    system: {
      web: {
        port: 8181
      },
      queue: {
        mainLoopInterval: 25,
        numberOfRetriesForMissingMessages: 3,
        statusRequestUpdateInverval: 500,
        timeBetweenQueueSending: 100
      },
      logs: {
        system: {
          console: {
            colorize: true,
            label: 'system',
            level: 'info',
          },
          file: {
            filename: '/logs/system.log'
          }
        },
        events: {
          console: {
            colorize: true,
            label: 'events',
            level: 'info',
          },
          file: {
            filename: '/logs/events.log'
          }
        },
        pump: {
          console: {
            colorize: true,
            label: 'pump',
            level: 'info',
          },
          file: {
            filename: '/logs/power.log'
          }
        },
      },
      communications: [
        {
          name: 'serialPort',
          type: 'rs485',
          hardwareAddress: '/dev/ttyUSB0'
        },
        {
          name: 'GPIOTest',
          type: 'gpio',
        }
      ]
    },
    equipment: {
      pumps: [
        {
          name: 'Pump1',
          enabled: true,
          communications: {
            address: '1',
            protocol: 'pentair',
            type: 'rs485',
            hardwareAddress: '/dev/ttyUSB0'
          }
        }
      ],
      controllers: [
        {
          name: 'intellicom',
          enabled: true,
          override: false
        },
        {
          name: 'intellitouch',
          enabled: false,
          override: false
        }
      ]
    },
    groups: [
    ],
    activities: [

    ]
  };
};

module.exports.defaults = defaultsFunction();

// module.exports.config = module.exports.init();
module.exports.config = {};

module.exports.retrieveConfigInfo = function (pathString = '') {
  var path = pathString.split('.');
  var obj = module.exports.config;

  for (var i = 0; i < path.length; i++) {
    if (!obj[path[i]]) {
      obj = undefined;
      break;
    }
    obj = obj[path[i]];
  }
  return obj;
};


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
    data = module.exports.defaults;
    logger('system', 'info', 'Using Default Configuration');
  } else {
    try {
      data = fs.readFileSync(location, 'utf8');
      data = parseConfig(data);
      logger('system', 'info', 'Config: Using file at ' + configFileLocation);
    } catch (err) {
      data = module.exports.defaults;
      logger('system', 'info', 'Config: User Config File not found. Using Default Configuration');
    }
  }
  Object.assign(module.exports.config, data);
  return module.exports;
};

module.exports.initLogging = function (newLogger) {
  if (newLogger) {
    logger = newLogger;
    logs.forEach(log => {
      newLogger(log[0], log[1], log[2]);
    });
  }
};


module.exports.loadConfig = function () {
  fs.readFile(configFileLocation, 'utf8', (err, data) => {
    if (err) {
    } else {
      parseConfig(data, function (err, data) {
        if (err) {
          logger('system', 'error', 'Error Processing Config File', err);
          // console.log ('Error Processing Config File', err);
        } else {
          logger('system', 'info', '');
          module.exports.config = data;
        }
      });
    }
  });
};


module.exports.saveConfig = function () {
  fs.writeFile(configFileLocation, JSON.stringify(config, null, 2), 'utf8', (err) => {
    if (err) {
      logger('system', 'info', '');
      console.log ('Error writing config file', err);
    } else {
      logger('system', 'info', '');
      // console.log ('Success writing config file');
    }
  });
};

module.exports.loadDefault = function () {
  config = defaults;
  logger('system', 'info', '');
};


module.exports.resetDefault = function () {
  module.exports.loadDefault();
  module.exports.saveConfig();
};

var exportTestString = function () {
  var functionString = defaultsFunction.toString();
  var firstIndex = functionString.indexOf('\n');
  functionString = functionString.slice(firstIndex + 1);
  var secondIndex = functionString.indexOf('\n');

  // console.log(functionString.indexOf('\n'));
  // console.log(functionString.slice(secondIndex + 1));
  // console.log(lastIndex);

  var lastIndex = functionString.lastIndexOf('\n');
  functionString = functionString.slice(0, lastIndex - 2);
  return JSON.parse(functionString);

};