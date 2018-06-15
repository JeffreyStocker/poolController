const path = require('path');

var ActionQueue = require (path.resolve(__dirname + '/../../Classes/ActionQueue.js'));
var msg = require (path.resolve(__dirname + '/PentairMessages.js'));
var Message = msg.Message;

var socketServer = require (path.resolve(__dirname + '/../../server.js')).socketServer;
var logger = requireGlob ('winston').sendToLogs;
var logStatus = requireGlob ('pentairPumpStatusLog.js');
var currentLogs = requireGlob ('CurrentLogs.js');

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
      // start: function (context) {
      //   return msg.defaultPumpControlPanelMessage('remote');
      // },
      empty: function (context) {
        return msg.defaultPumpControlPanelMessage('local');
      }
    }});

    this.name = name;
    this.timers = {};
    this.options = options || {};
    this.serialPort = options.serialPort || (() => {});
    //note need to get rid of this later
    if (options.serialPort && options.serialPort.constructor.name === 'SerialPort') {
      try {
        options.serialPort.on('data', (dataFromSerialPort) => {
          this.processData(dataFromSerialPort);
        });
      } catch (err) {
        logger ('system', 'warn', 'Unable to set event for ' + this.name + '\'s serialport');
      }
    }
    this.source = options.source || 16;
    this.logger = options.logger || logger;
    this.running = false;
    this.messageTimeoutLength = options.messageTimeoutLength || 500;
    this.numberOfRetries = options.numberOfRetries || 3;
    this.hardwareAddress = options.hardwareAddress || undefined;

    this.currentRetries = 0;
    this.timeout;
    this.currentMessage;

    this.externalMessage = {
      timer: null,
      status: false
    };

  }


  add(message, destination) {
    super.add(message);
    // if (this.length === 1) {
    //   this.runQueue();
    // }
    this.runQueue();
  }


  continueQueue(callbackMessage) {
    this.clearCurrentMessage(callbackMessage);
    this.runQueue();
  }


  checkQueue (incomingMessage) {
    // debugger;
    var queuedMessage = this.currentMessage;
    if (!queuedMessage) { return null; }

    if (this.currentMessage.tryAcknowledgment(incomingMessage)) {
      return true;
    }
    return false;
  }

  clearCurrentMessage(callbackError, callbackMessage) {
    clearInterval(this.timeout);
    this.timeout = undefined;
    this.currentRetries = 0;
    this.currentMessage.callback(callbackError, callbackMessage);
    this.currentMessage = undefined;
  }

  runQueue (resend = false) {
    var message = this.currentMessage || this.pull();

    if (!this.currentMessage) {
      if (!message) { return; }
      this.currentMessage = message;
      message.setSource (this.source);
      this.sendToSerialPort(message);
    } else if (resend) {
      this.sendToSerialPort(message);
    }

    if (message.timers || message.timers === 0) { this.setTimers(this.currentMessage); }

    if (!this.timeout) {
      this.timeout = setInterval(() => {
        // debugger;
        if (this.currentRetries < this.numberOfRetries) {
          this.currentRetries++;
          this.logger('events', 'debug', this.currentRetries + ': Message timed out waiting for acknowledgment: ', message.name);
        } else {
          this.logger('events', 'info', this.currentMessage.name + ': Message timeout: ' + message.name + '\nError: Removing message from queue');
          this.clearCurrentMessage('Message failed to send to pump');
        }
        this.runQueue(resend = true);
      }, this.messageTimeoutLength);
    }
  }

  checkForExternalMessasgeToSameSource(messageData) {
    if (messageData === null) {
      return false;
    }

    if (/* messageData[3] === this.source && */ messageData[2] === this.destination) {
      clearTimeout(this.externalMessage.timer);
      this.externalMessage.status = true;
      this.externalMessage.timer = setTimeout(() => {
        this.externalMessage.status = false;
      }, 60000);
      return true;
      // msg.reverseAddresses[messageData[3]] === this.source;
    } else {
      return false;
    }
  }


  processData(data) {
    // debugger;
    var processedData = Message.prototype.processIncomingPacket(data);
    var checkQueueResults = this.checkQueue(processedData);

    this.checkForExternalMessasgeToSameSource(processedData);

    if (Message.prototype.isStatusMessage(processedData)) {
      var pumpData = Message.prototype.parsePumpStatus(processedData);
      this.logger('status', 'info', 'Status Received:  [' + [... processedData] + ']');

      logStatus.log({
        equipment: this.name,
        watt: pumpData.watt,
        rpm: pumpData.rpm
      });

      currentLogs.addData(this.name, pumpData.watt, pumpData.rpm);

      try {
        socketServer.emit('pumpDataReturn', pumpData);
      } catch (err) {
        this.logger('system', 'error', 'Error sending pump data via socketIO' + err);
      }
      if (this.currentMessage.name === 'Get Pump Status') {
        this.clearCurrentMessage(null, 'success');
      }
    } else if (processedData === null) {
      logger('events', 'info', 'Message Received but not a packet: ' + data);
    } else if (checkQueueResults === true) {
      this.logger('events', this.currentMessage.logLevel, 'Acknowledged: ' + this.currentMessage.name + ': [' + processedData + ']');
      this.clearCurrentMessage(null, 'success');
    } else if (checkQueueResults === false) {
      this.logger('events', 'warn', 'Packet was not an acknowledgment: ' + processedData);
    } else if (checkQueueResults === null) {
      logger('events', 'info', 'Message Received: ' + processedData);
    } else {
    }
    this.runQueue();
  }

  clearTimer (timerName) {
    if (this.timers[timerName]) {
      clearInterval(this.timers[timerName]);
      delete this.timers[timerName];
      logger('events', 'debug', 'Timer Cleared: ' + timerName);
    }
  }


  setIndivTimer (timerName, duration, message) {
    if (duration > 0) {
      this.timers[timerName] = setInterval(() => {
        this.add(message);
      }, duration);
      logger('events', 'debug', 'New timer set: ' + timerName + ' for ' + duration + ' in ' + message.name);
    }
  }


  setTimers(message) {
    var newTimers = message.timers;
    if (!newTimers && newTimers !== 0) {
      return;
    } else if (Array.isArray(newTimers)) {
      for (var timerName of Object.keys(newTimers)) {
        let timer = newTimers[timerName];
        let name = timer.name;
        let duration = timer.interval;
        this.clearTimer(name);

        if (duration > 0) {
          this.setIndivTimer(name, duration, message);
        }
      }
    } else if (typeof newTimers === 'object') {
      this.clearTimer(newTimers.name);
      this.setIndivTimer(newTimers.name, newTimers.interval, message);
    } else if (typeof newTimers === 'number') {
      this.clearTimer('run');
      this.setIndivTimer('run', newTimers, message);
    } else {
      logger('events', 'warn', 'Timers in a message should be a object  \
      {name: name, interval:amount of time}, or array of said objects, or to set the "run" timer use just a number');
    }
  }

  hasStatusTimer() {
    if (this.timers.status) {
      return true;
    }
    return false;
  }

  sendToSerialPort(message, callback = () => {}) {
    if (this.serialPort) {
      var packet = message.packet;
      this.serialPort.write(Buffer.from(packet), function (err) {
        if (err) {
          logger('events', 'error', 'sendData: Error writing [' + packet + '] to serialPort:' + err);
          callback (null, data);
        } else {
          logger('events', 'debug', 'sendData: Success writing ' + packet + ' to serialPort');
          callback (err, null);
        }
      });
    }
  }
};