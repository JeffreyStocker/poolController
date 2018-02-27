var ActionQueue = require (process.env.NODE_PATH + '/server/Classes/ActionQueue.js');
var msg = require (process.env.NODE_PATH + '/server/equipment/pentair/PentairMessages.js');
var serialPorts = require(process.env.NODE_PATH + '/server/communications/serialPort_modular').ports;
var helpers = require(process.env.NODE_PATH + '/server/helpers');
var PentairQueue = requireGlob('PentairQueue');

var _ = require ('lodash');

var empty = function (context) {
  return msg.defaultPumpControlPanelMessage('local');
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


class QueueGroup {
  constructor (logger = ()=>{}) {
    this.equipment = {};
    this.logger = logger;
    this.names = {};
    this.queues = {};
  }

  init(queueNames = {}, output = {}, logger = ()=>{}) {
    this.setLogger(logger);
    _.each(queueNames, (group) => {
      _.each(group, (newQueueInfo) => {
        // newQueueInfo.serialPort = serialPorts.returnPortByName(newQueueInfo.hardwareAddress);
        this.createQueue(newQueueInfo);
      });
    });
    return module.exports;
  }

  checkIfQueueExists (queueName) {
    if (!this.queues[queueName]) {
      return false;
    }
    return true;
  }

  addQueueName (name, hardwareAddress) {
    this.names[name] = this.queues[hardwareAddress];
    // if (this.checkIfQueueExists(name)) {
    // } else {
    //   throw new Error (port + ' address is not a valid queue port');
    // }
  }

  associateEquipment (unitsToAdd = {}) {
    for (let unit of unitsToAdd) {
      this.addQueueName(unit.name, unit.communications.hardwareAddress);
    }
  }

  createQueue (queueInfo) {
    var name, address;
    if (!queueInfo.name) {
      this.logger('system', 'warn', 'Could not create a new queue with this name: ' + queueInfo.name);
      return;
    }
    this.names[queueInfo.name] = this.queues[queueInfo.hardwareAddress] = new PentairQueue(queueInfo.name, queueInfo);
    this.logger ('system', 'info', queueInfo.name + ': queue created');
    return this.names[queueInfo.name];
  }

  eachQueue (callback) {
    for (let queue of Object.keys(this.queues)) {
      callback(queue);
    }
  }

  returnQueue (uueueName) {
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
    callback(message);
  }

  checkQueue(queueName, message) {
    if (!this.names[queueName]) { return null; }
    return this.names[queueName].checkQueue(message);
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

  setLogger (newLogger = logger) {
    if (this.logger !== newLogger && typeof newLogger === 'function') {
      this.logger = newLogger;
    }
  }
}

module.exports = new QueueGroup();