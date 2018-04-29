process.env.NODE_PATH = process.env.NODE_PATH || __dirname + '/../../..';
var ActionQueue = require (process.env.NODE_PATH + '/server/Classes/ActionQueue.js');
var msg = require (process.env.NODE_PATH + '/server/equipment/pentair/PentairMessages.js');
var Message = msg.Message;
var socketServer = require (process.env.NODE_PATH + '/server/server.js').socketServer;
var logger = requireGlob ('winston').sendToLogs;
var logStatus = requireGlob ('pentairPumpStatusLog.js');

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
    if (options.serialPort && options.serialPort.constructor.name === 'SerialPort') {
      options.serialPort.on('data', (dataFromSerialPort) => {
        this.processData(dataFromSerialPort);
      });
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

    // if (this.hardwareAddress) {
    //   this.setPort(this.hardwareAddress);
    // }

    // this.storeStatus = (function () {
    //   //psudocode
    //   /*
    //   going to use context
    //   use
    //   check speed,
    //     if same, then add watt to watt sum
    //   if not same rpm, then find average of watt sum
    //   store average watt, speed and date into the database
    //   set time to now
    //   set watt sum to 0
    //   set rpm to current
    //   */
    //   var storedDate;
    //   var storedRpm = null;
    //   var wattSum = 0;
    //   var wattCount = 0;
    //   return function (data) {
    //     if (data.rpm === storedRpm) {
    //       wattSum += data.watt;
    //       wattCount ++;
    //       return Promise.resolve(null);
    //     }
    //     let output = {
    //       date,
    //       rpm,
    //       watt: ~~(wattSum / wattCount),
    //     };
    //     rpm = data.rpm;
    //     wattSum = data.watt;
    //     wattCount = 1;
    //     date = new Date();
    //     return Promise.resolve(output);
    //   };
    // })();
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
    var response = this.currentMessage.tryAcknowledgment(incomingMessage);
    if (response === true) {
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
          this.logger('events', 'info', this.currentRetries + ': Message timeout: ' + message.name + '\nError: Removing message from queue');
          this.clearCurrentMessage('Message failed to send to pump');
        }
        this.runQueue(resend = true);
      }, this.messageTimeoutLength);
    }
  }

  processData(data) {
    debugger;
    data = Message.prototype.processIncomingPacket(data);
    var results = this.checkQueue(data);
    if (Message.prototype.isStatusMessage(data)) {
      var pumpData = Message.prototype.parsePumpStatus(data);
      this.logger('status', 'info', 'Status Received:  [' + [... data] + ']');
      // this.storeStatus(pumpData)
      //   .then(resultsFromBeforeRpmChange => {
      //     if (resultsFromBeforeRpmChange) {
      //       logStatus.log({
      //         equipment: this.name,
      //         watt: resultsFromBeforeRpmChange.watt,
      //         rpm: resultsFromBeforeRpmChange.rpm
      //       });
      //     }
      //   })
      // .catch (this.logger('events', 'warn', err));
      logStatus.log({
        equipment: this.name,
        watt: pumpData.watt,
        rpm: pumpData.rpm
      });
      try {
        socketServer.emit('pumpDataReturn', pumpData);
      } catch (err) {
        this.logger('system', 'error', 'Error sending pump data via socketIO' + err);
      }
      if (this.currentMessage.name === 'Get Pump Status') {
        this.clearCurrentMessage(null, 'success');
      }
    } else if (results === true) {
      this.logger('events', this.currentMessage.logLevel, 'Acknowledged: ' + this.currentMessage.name + ': [' + data + ']');
      this.clearCurrentMessage(null, 'success');
    } else if (results === false) {
      this.logger('events', 'warn', 'Packet was not an acknowledgment: ' + data);
    } else if (results === null) {
      logger('events', 'info', 'Message Received: ' + data);
    } else {
    }
    this.runQueue();
  }


  setPort (hardwareName) {
    this.serialPort = serialPort.returnPortByName(this.hardwareAddress);
    // serialPort.setTrigger(hardwareName, 'data', (data) => {
    //   processData(data);
    // });
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