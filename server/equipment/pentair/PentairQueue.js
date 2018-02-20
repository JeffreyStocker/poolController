process.env.NODE_PATH = process.env.NODE_PATH || __dirname + '/../../..';
var ActionQueue = require (process.env.NODE_PATH + '/server/Classes/ActionQueue.js');
var msg = require (process.env.NODE_PATH + '/server/equipment/pentair/PentairMessages.js');

module.exports = class PentairQueue extends ActionQueue {
  constructor (name, source = 16, serialPort, options = {logger: () => {}, numberOfRetries: 3, messageTimeoutLength: 100}) {
    super ( {
      empty: function (context) {
        return msg.defaultPumpControlPanelMessage('local');
      }
    });
    if (!options) { options = {}; }
    this.timers = {};
    this.source = source;
    this.logger = options.logger || (function () {});
    this.running = false;
    this.messageTimeoutLength = options.messageTimeoutLength || 100;
    this.numberOfRetries = options.numberOfRetries || 3;
    this.currentRetries = 0;
    this.timeout;
    this.currentMessage;

  }

  add(message) {
    super.add(message);
    if (this.length === 1) {
      this.runQueue();
    }
  }

  sendToSerialPort() {

  }

  runQueue () {
    var message = this.currentMessage || this.pull();

    if (!message) { return; }

    message.setSource (this.source);
    message.prep();
    this.sendToSerialPort(message);

    if (!this.timeout) {
      this.timeout = setTimeout(() => {
        if (this.currentRetries < this.numberOfRetries) {
          this.logger('events', 'debug', 'Message timedout waiting for acknowledgment: ', message.name);
          this.currentRetries++;
        } else {
          this.logger('events', 'warn', 'Message timeout ' + this.currentRetries + ': ', message.name + '/n Removing message from queue');
          this.currentRetries = 0;
        }
        this.runQueue();
      }, this.messageTimeoutLength);
    }
  }

  checkQueueForAcknowledgment (incomingMessage) {
    var queuedMessage = this.queues[queueName].peak();
    var response = queuedMessage.tryAcknowledgment(incomingMessage);
    if (response === true) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
      this.unshift();
      this.currentRetries = 0;
      this.logger('events', queuedMessage.logLevel, message.name + ': Received Return');
      this.runQueue();
      return true;
    } else if (!response) {
      this.logger('events', 'debug', message.name + ': achologment failed for ' + incomingMessage);
      return false;
    }
  }
};

var temp = new module.exports('test');
temp.add('test');