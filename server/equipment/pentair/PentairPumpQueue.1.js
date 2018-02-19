var ActionQueue = require (process.env.NODE_PATH + '/server/Classes/ActionQueue.js');
var msg = require (process.env.NODE_PATH + '/server/preBuiltMessages.js');
var serialPorts = require(process.env.NODE_PATH + '/server/serialPort_modular').ports;
var helpers = require(process.env.NODE_PATH + '/server/helpers');



var logger = require(process.env.NODE_PATH + '/server/logging/winston').sendToLogs;

var empty = function (context) {
  return pumpToLocal.byte;
};

var start = function () {
  return pumpToRemote.byte;
};

var add = function (context) {
  if (!context.timer) {
    context.timer = setInterval(function () {

    }.bind(context || this), config.system.timeBetweenQueueSending);
  }
  return;
};

module.exports.init = function (pumps = {}, logger = ()=>{}) {
  module.exports.setLogger(logger);

  var queues = module.exports.pentairPumpQueues = new PentairPumpQueues(logger);
  var pumpsNames = Object.keys(pumps);
  for (var pump of pumpsNames) {
    try {
      if (pump.enabled === true) {
        queues.createQueue(pump);
      }
    } catch (err) {
      logger ('system', 'warn', err);
    }
  }
};


class PentairPump extends ActionQueue {
  constructor (name, source, destination, options = {}) {
    super ();
    this.timers = {};
    this.destination;
    this.source = 16;
    this.logger = options.logger || (function () {});

    //////////////////////////

    var name, protocol, address;
    if (!queueInfo.name || !queueInfo.communications) {
      logger('system', 'warn', 'Could not create a new queue with this name: ' + queueInfo.name);
      return;
    }
    try {
      name = queueInfo.name;
      protocol = queueInfo.communications.protocol;
      address = msg.addresses['pump' + queueInfo.communications.address];
    } catch (err) {
      logger('system', 'warn', 'Could not create a new queue with this name: ' + queueInfo.name + ' | ' + err);
    }

    if (!this.queues[queueInfo.name]) {
      this.queues[queueName] = new ActionQueue ({empty, start, add});
    }
    return this.queues[queueName];
  }

  addMessageToQueue(queueName, message, callback = ()=>{}) {

    if (!this.queues[queueName]) { return null; }

    this.queues[queueName].add(message);
    callback();
  }

  checkQueue(queueName, incomingMessage) {
    if (!this.queues[queueName]) {
      return null;
    }
    var queuedMessage = this.queues[queueName].peak();
    var response = queuedMessage.tryAcknowledgment(incomingMessage);
    if (response) {
      this.unshift();
      this.logger('event', queuedMessage.logLevel, message.name + ': Received Return');
      return true;
    } else if (response === -1) {
      this.logger('event', 'info', message.name + ': timedout');
    } else if (!response) {
      this.logger('event', 'verbose', message.name + ': Received Return');
      return false;
    }
  }

  setTimer (name, time, func = ()=>{}) {
    if (this.timers[name]) {
      this.timers[name] = setInterval(func, time);
    }
  }

  returnTimer (name) {
    return this.timers[name];
  }
  cancelTimer (name) {
    try {
      clearInterval(this.timers[name]);
    } catch (err) {
    }
  }
}