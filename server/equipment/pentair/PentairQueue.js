process.env.NODE_PATH = process.env.NODE_PATH || __dirname + '/../../..';
var ActionQueue = require (process.env.NODE_PATH + '/server/Classes/ActionQueue.js');
var msg = require (process.env.NODE_PATH + '/server/equipment/pentair/PentairMessages.js');
var Message = msg.Message;
// var { processIncomingSerialPortData } = require(process.env.NODE_PATH + '/server/communications/serialPort.js');
var serialPort = requireGlob('serialPort_modular');
var socketServer = require (process.env.NODE_PATH + '/server/server.js').socketServer;
// var ports = requireGlob('serialPort_modular');
var logger = requireGlob ('winston').sendToLogs;

module.exports = class PentairQueue extends ActionQueue {
  constructor (
    name,
    options = {
      logger: () => {},
      messageTimeoutLength: 100,
      numberOfRetries: 3,
      source: 16
    }) {

    super ({actions: {
      empty: function (context) {
        return msg.defaultPumpControlPanelMessage('local');
      }
    }});
    this.name = name;
    this.timers = {};
    this.options = options || {};

    this.serialPort = (() => {});
    this.source = options.source || 16;
    this.logger = options.logger || logger;
    this.running = false;
    this.messageTimeoutLength = options.messageTimeoutLength || 100;
    this.numberOfRetries = options.numberOfRetries || 3;
    this.hardwareAddress = options.hardwareAddress || undefined;

    this.currentRetries = 0;
    this.timeout;
    this.currentMessage;

    if (this.hardwareAddress) {
      this.setPort(this.hardwareAddress);
    }
  }


  add(message, destination) {
    super.add(message);
    // if (this.length === 1) {
    //   this.runQueue();
    // }
    this.runQueue();
  }


  continueQueue() {
    this.currentMessage = null;
    clearInterval(this.timer);
    this.timer = null;
    this.currentRetries = 0;
    this.runQueue();
  }


  checkQueue (incomingMessage) {
    var queuedMessage = this.currentMessage;
    if (!queuedMessage) { return false; }
    var response = this.currentMessage.tryAcknowledgment(incomingMessage);
    if (response === true) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
      this.currentRetries = 0;
      return true;
    }
    return false;
  }


  runQueue (resend = false) {
    var message = this.currentMessage || this.pull();
    if (!this.currentMessage) {
      this.currentMessage = message;
      if (!message) { return; }

      message.setSource (this.source);
      this.sendToSerialPort(message);
    } else {
      message = this.currentMessage;
    }

    if (!message.timers) { this.setTimers(this.currentMessage); }

    if (!this.timeout) {
      this.timeout = setInterval(() => {
        if (this.currentRetries < this.numberOfRetries) {
          this.logger('events', 'debug', 'Message timedout waiting for acknowledgment: ', message.name);
          this.currentRetries++;
        } else {
          this.logger('events', 'warn', 'Message timeout ' + this.currentRetries + ': ', message.name + '/n Removing message from queue');
          this.currentRetries = 0;
          this.currentMessage.callback('Message failed to send to pump');
          this.currentMessage = undefined;
          clearInterval(this.timeout);
          this.timeout = null;
        }
        this.runQueue(resend = true);
      }, this.messageTimeoutLength);
    }
  }


  setPort (hardwareName) {
    this.serialPort = serialPort.returnPortByName(this.hardwareAddress);
    serialPort.setTrigger(hardwareName, 'data', function (data) {
      data = Message.prototype.processIncomingPacket(data);
      console.log('Message Recieved: ', data);
      logger('events', 'debug', 'Message Recieved: ' + data);
      debugger;
      if (this.checkQueue(data) === true) {
        this.logger('events', 'info', this.currentMessage.logLevel, this.currentMessage.name + ': Received Return');
        if (Message.prototype.isStatusMessage(data)) {
          var pumpData = requireGlob('helperFunctions').parsePumpStatus(data);
          this.logger('status', 'info', 'Data Received:  [' + [... data] + ']');
          try {
            socketServer.emit('pumpDataReturn', pumpData);
          } catch (err) {
            this.logger('system', 'error', 'Error sending pump data via socketIO' + err);
          }
        } else {

        }
        this.currentMessage.callback(null);
      } else {
        this.logger('events', 'warn', 'Packet was not an acknowledgment: ' + data);
      }
      this.runQueue();
    }.bind(this));
  }


  clearTimer (timerName) {
    if (this.timers[timerName]) {
      clearInterval(this.timers[timerName]);
      delete this.timers[timerName];
      logger('events', 'debug', 'Timer Cleared: ' + timerName);
    }
  }


  setIndivTimer (timerName, duration, message) {
    this.timers[name] = setInterval(() => {
      this.add(message);
    }, duration);
    logger('events', 'debug', 'New timer set: ' + timerName + ' for ' + duration + ' in ' + message.name);
  }


  setTimers(message) {
    debugger;
    var newTimers = message.timers;
    if (!Array.isArray(newTimers)) {
      for (var timer of newTimers) {
        let name = timer.name;
        let duration = timer.interval;
        this.clearTimer(name);

        if (duration >= 0) {
          this.setIndivTimer(name, duration, message);
        }
      }
    } else if (typeof timers === 'object') {
      this.clearTimer(message.timers.name);
      this.setIndivTimer(message.timers.name, message.timers.interval, message);
    } else if (typeof message.timers === 'number') {
      this.clearTimer('run');
      this.setIndivTimer('run', message.timers, message);
    } else {
      logger('events', 'warn', 'Timers in a message should be a object  \
      {name: name, interval:amount of time}, or array of said objects, or to set the "run" timer use just a number');
    }
  }


  sendToSerialPort(message) {
    if (this.serialPort) {
      serialPort.sendData(this.hardwareAddress, message)
        .then(data => {})
        .catch(err => {});
    }
  }
};