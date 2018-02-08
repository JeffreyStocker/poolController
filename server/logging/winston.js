var winston = require('winston');
// var config = require(process.env.NODE_PATH + '/server/configureFile');

module.exports.loggers = {};
var logs = [];

module.exports.initLogging = function (loggerName) {
  if (!module.exports.loggers[loggerName]) { return new Error ('Logger Missing from initLogging'); }

  var logger = module.exports.loggers[loggerName];
  logs.forEach(log => {
    logger.debug(log);
  });
  logs = function (newLog) {
    logger.debug(newLog);
  };
};

var logInternal = function (newLog) {
  if (Array.isArray(logs) === true) {
    logs.push(newLog);
  } else {
    logs(newlog);
  }
};

module.exports.sendToLogs = function (loggerName, level, message) {
  var logger = module.exports.loggers[loggerName];
  if (logger === undefined) { return; }
  logger.info(level, message);
};

module.exports.init = function (logs = {}) {

  winston.loggers.close('system');
  var logName = Object.keys(logs);
  logName.forEach((name) => {
    // if (name === 'system') { return }
    if (!!logs[name].hasOwnProperty('file')) {
      var currentLogFile = logs[name].file.filename;
      if (currentLogFile[0] === '/' || currentLogFile[0] === '\\') {
        logs[name].file.filename = process.env.NODE_PATH + currentLogFile;

      } else {
        logs[name].file.filename = process.env.NODE_PATH + '\\' + currentLogFile;
      }
    }
    winston.loggers.add(name, logs[name]);
    module.exports.loggers[name] = winston.loggers.get(name);
    // module.exports.loggers[name] = winston.loggers.get(name);
    logInternal('Added New Logger: ' + name);
  });
  return module.exports.loggers;
};



// winston.loggers.add('system', {
//   console: {
//     level: 'info',
//     colorize: false,
//     label: 'system',
//   },
//   file: {
//     filename: process.env.NODE_PATH + '/server/logs/system.log'
//   }
// });

// module.exports.loggers.system = winston.loggers.get('system');
// module.exports.loggers.system.info('test');

// var { system: {logs} } = require('../configureFile').config;

// var wait = setupLogging(logs);

// console.log (Object.keys(exports.loggers.power.info('test')));
// console.log (Object.keys(exports.loggers.events.info('testEvents')));
// console.log (Object.keys(exports.loggers.system.info('system,test')));

