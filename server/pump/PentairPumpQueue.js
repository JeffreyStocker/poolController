var ActionQueue = require (process.env.NODE_PATH + '/server/Classes/ActionQueue.js');
var messages = require (process.env.NODE_PATH + '/server/messages.js');
var config = require (process.env.NODE_PATH + '/server/variables.js').config;

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

class PentairPumpQueues extends ActionQueue {
  constructor () {
    super ();
    this.queues = { };
    this.timers = [];
    this.destination;
    this.source;

  }

  checkIfQueueExists (queueName) {

  }

  createQueue (queueName, type) {
    if (!this.queues[queueName]) {
      this.queues[queueName] = new Queue ({empty, start, add});
    }
    return this.queues[queueName];
  }

  removeQueue(queueName) {
    if (!this.queues[queueName]) {
      return null;
    }
    delete this.queues[queueName];
  }

  addMessageToQueue(queueName, message, callback = ()=>{}) {
    if (!this.queues[queueName]) { return null; }

    this.queues[queueName].add(message);
    callback();
  }

  checkQueueForAcknowledgment (queueName, message) {
    if (!this.queues[queueName]) {
      return null;
    }
    var queuedMessage = this.peak();
    var response = queuedMessage.tryAcknowledgment(message);
    if (response) {

      return true;
    } else {
      return false;
    }
  }

  listQueueNamesAndTypes () {
    return this.queues;
  }

}
