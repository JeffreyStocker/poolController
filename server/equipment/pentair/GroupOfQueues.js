const ActionQueue = require (process.env.NODE_PATH + '/server/Classes/ActionQueue.js');
const msg = require (process.env.NODE_PATH + '/server/equipment/pentair/PentairMessages.js');
const serialPorts = require(process.env.NODE_PATH + '/server/communications/serialPort').ports;
const helpers = require(process.env.NODE_PATH + '/server/helpers');
const PentairQueue = requireGlob('PentairQueue');

var _ = require ('lodash');

var avaliableQueueTypes = {
  pentair: requireGlob('PentairQueue')
};

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
    for (let queueInfo of queueNames) {
      try {
        if (queueInfo.enabled && avaliableQueueTypes[queueInfo.communications.protocol]) {
          this.addQueue(new PentairQueue(queueInfo.name, queueInfo), queueInfo.name, queueInfo.communications.hardwareAddress);
        }
      } catch (err) {
        this.logger('system', 'warn', 'Could not create a new queue with this name: ' + name);
      }
    }

    // _.each(queueNames, (group) => {
    //   _.each(group, (newQueueInfo) => {
    //     newQueueInfo.serialPort = serialPorts.returnPortByName(newQueueInfo.hardwareAddress);
    //     this.createQueue(newQueueInfo);
    //   });
    // });
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

  addQueue (queue, name, address) {
    if (!queue || !name) {
      this.logger('system', 'warn', 'Could not create a new queue with this name: ' + queueInfo.name);
      return;
    }
    this.names[name] = queue;
    this.logger ('system', 'info', name + ': queue created');
    return this.names[name];
  }

  eachQueue (callback) {
    for (let queue of Object.keys(this.queues)) {
      callback(this.queues[queue]);
    }
  }

  returnQueue (queueName) {
    return this.names[queueName];
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