process.env.NODE_PATH = process.env.NODE_PATH || __dirname + '/../../..';
var ActionQueue = require (process.env.NODE_PATH + '/server/Classes/ActionQueue.js');
var msg = require (process.env.NODE_PATH + '/server/equipment/pentair/PentairMessages.js');
var Message = msg.Message;
// var { processIncomingSerialPortData } = require(process.env.NODE_PATH + '/server/communications/serialPort.js');
var serialPort = requireGlob('serialPort_modular');
var socketServer = require (process.env.NODE_PATH + '/server/server.js').socketServer;
// var ports = requireGlob('serialPort_modular');
logger = requireGlob ('winston').sendToLogs;

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
    this.logger = options.logger || (function () {});
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


  add(message) {
    super.add(message);
    // if (this.length === 1) {
    //   this.runQueue();
    // }
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
      this.runQueue();
      return true;
    }
    return false;
  }

  runQueue () {
    var message = this.currentMessage || this.pull();
    if (!this.currentMessage) {
      this.currentMessage = message;
      if (!message) { return; }

      message.setSource (this.source);
      this.sendToSerialPort(message);
    } else {
      message = this.currentMessage;
    }

    // if (!message) { return; }

    if (!this.timeout) {
      this.timeout = setTimeout(() => {
        if (this.currentRetries < this.numberOfRetries) {
          this.logger('events', 'debug', 'Message timedout waiting for acknowledgment: ', message.name);
          this.currentRetries++;
        } else {
          this.logger('events', 'warn', 'Message timeout ' + this.currentRetries + ': ', message.name + '/n Removing message from queue');
          this.currentRetries = 0;
          this.currentMessage.callback('Message failed to send to pump');
          this.currentMessage = undefined;
        }
        this.runQueue();
      }, this.messageTimeoutLength);
    }
  }


  setPort (hardwareName) {
    // debugger;
    this.serialPort = serialPort.returnPortByName(this.hardwareAddress);
    serialPort.setTrigger(hardwareName, 'data', function (data) {
      data = Message.prototype.processIncomingPacket(data);
      console.log('Message Recieved: ', data);
      logger('event', 'info', 'Message Recieved: ' + data);
      debugger;
      if (this.checkQueue(data) === true) {
        this.logger('events', 'info', queuedMessage.logLevel, message.name + ': Received Return');
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
        this.logger('events', 'warn', 'Packet was not an acknowledgment' + data);
      }
    }.bind(this));
  }


  setTimers(newTimers = {}, message) {
    for (var timer of Object.keys(newTimers)) {
      if (this.timers[timer]) {
        clearInterval(this.timers[timer]);
        delete this.timers[timer];
      }

      if (newTimer[timer] >= 0) {
        this.timers[timer] = setInterval(() => {
          this.add(message);
        }, newTimers[timer]);
      }
    }
  }


  sendToSerialPort(message) {
    if (this.serialPort) {
      debugger;
      serialPort.sendData(this.hardwareAddress, message)
        .then(data => {

        })
        .catch(err => {

        });
    }
  }
};