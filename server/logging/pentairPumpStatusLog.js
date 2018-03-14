var glob = require('glob');
var PentairMessage = require('./../equipment/pentair/PentairMessages.js');
var winston = require('winston');

var logStatus, currentMin;
var currentLogs = [];
var interval = 5;


var init = function (invervalInMin = 5) {
  var now = new Date();
  currentMin = now.getHours();
  logStatus = winston.loggers.add('pumpStatus', {file: { filename: './logs/status.logs'}});
  interval = invervalInMin || interval;
};

var shrink = function (logDataForFiveMins) {
  var totalWatts = 0;
  var totalRpm = 0;
  if (logDataForFiveMins.length === 0 ) { return; }
  for (let data of logDataForFiveMins) {
    totalWatts += data.watt;
    totalRpm += data.rpm;
  }
  logStatus.info({
    pump: logDataForFiveMins[0].pump,
    watts: ~~(totalWatts / logDataForFiveMins.length),
    rpm: ~~(totalRpm / logDataForFiveMins.length)
  });
};

module.exports.log = function (parsedPumpData) {
  var now = new Date();
  var hour = now.getHours();
  var day = now.getDate();
  var min = now.getMinutes();
  if (~~currentMin / interval !== ~~min / interval) {
    var tempCurrent = currentLogs;
    shrink(tempCurrent);
    currentLogs = [];
  }
  var { destination, watt, rpm } = parsedPumpData;
  if (!destination, !watt, !rpm) {
    return;
  }
  var data = {
    pump: PentairMessage.addresses[destination],
    watt: watt,
    rpm: rpm
  };
  currentLogs.push(data);
};

var wait = glob('./logs/status');

var temp = init();
module.exports.log({destination: 96, watt: 300, rpm: 100});