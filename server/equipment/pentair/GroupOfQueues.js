var ActionQueue = require (process.env.NODE_PATH + '/server/Classes/ActionQueue.js');
var msg = require (process.env.NODE_PATH + '/server/equipment/pentair/PentairMessages.js');
var serialPorts = require(process.env.NODE_PATH + '/server/communications/serialPort_modular').ports;
var helpers = require(process.env.NODE_PATH + '/server/helpers');

var PentairQueue = requireGlob('PentairQueue');

var logger = () => {};

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


module.exports.init = function (pumps = {}, queueTypes = {}, logger = ()=>{}) {
  module.exports.setLogger(logger);
  var queues = module.exports.PentairGroupOfQueues = new PentairGroupOfQueues(logger);

  // var pumpsNames = Object.keys(pumps);
  // for (var pump of pumps) {
  //   try {
  //     if (pump.enabled === true) {
  //       queues.createQueue(pump);
  //     }
  //   } catch (err) {
  //     logger ('system', 'warn', err);
  //   }
  // }
  var names = {};
  var queueT = {};

  Object.keys(queueTypes).forEach(queueName => {
    queues.createQueue(queueTypes[queueName]);
  });

  for (var pump of pumps) {
    try {
      if (pump.enabled === true && pump.communications.type === 'rs485') {
        queues.addQueueName(pump.name, pump.communications.hardwareAddress);
        // queues.createQueue(pump);
      }
    } catch (err) {
      logger ('system', 'warn', err);
    }
  }
  return module.exports;
};


class PentairGroupOfQueues {
  constructor (logger = ()=>{}) {
    this.names = {};
    this.queues = {};
    this.source = 16;
    this.logger = logger;
  }

  checkIfQueueExists (queueName) {
    if (!this.queues[port]) {
      return false;
    }
    return true;
  }

  addQueueName (name, hardwareAddress) {
    if (this.checkIfQueueExists(hardwareAddress)) {
      this.equipment[name] = this.queues[hardwareAddress];
    } else {
      throw new Error (port + ' address is not a valid queue port');
    }
  }

  createQueue (queueInfo) {
    var name, address;
    if (!queueInfo.name || !queueInfo.hardwareAddress) {
      logger('system', 'warn', 'Could not create a new queue with this name: ' + queueInfo.name);
      return;
    }
    this.names[queueInfo.name] = this.queues[queueInfo.hardwareAddress] = new PentairQueue();
    return this.names[queueInfo.name];
  }

  createQueue2 (queueInfo) {
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

  removeQueueName(queueName) {
    if (!this.names[queueName]) {
      return null;
    }
    delete this.names[queueName];
  }

  addMessageToQueue(queueName, message, callback = ()=>{}) {

    if (!this.names[queueName]) { return null; }

    this.names[queueName].add(message);
    callback();
  }

  checkQueueForAcknowledgment (queueName, incomingMessage) {
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

  listQueueNamesAndTypes () {
    return this.queues;
  }

  setTimer (queueName, name, time, func = ()=>{}) {
    if (this.timers[queueName]) {
      this.timers[queueName][name] = setInterval(func, time);
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


module.exports.setLogger = function (newLogger = logger) {
  if (logger !== newLogger && typeof newLogger === 'function') {
    logger = newLogger;
  }
};