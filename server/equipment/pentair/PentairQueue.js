process.env.NODE_PATH = process.env.NODE_PATH || __dirname + '/../../..';
var ActionQueue = require (process.env.NODE_PATH + '/server/Classes/ActionQueue.js');
var msg = require (process.env.NODE_PATH + '/server/equipment/pentair/PentairMessages.js');
var Message = msg.Message;
var processIncomingSerialPortData = require(process.env.NODE_PATH + '/server/communications/serialPort.js').processIncomingSerialPortData;
var socketServer = require (process.env.NODE_PATH + '/server/server.js').socketServer;


module.exports = class PentairQueue extends ActionQueue {
  constructor (
    name,
    serialPort,
    options = {
      logger: () => {},
      messageTimeoutLength: 100,
      numberOfRetries: 3,
      source: 16
    }) {
    super ({
      empty: function (context) {
        return msg.defaultPumpControlPanelMessage('local');
      }
    });
    if (!options) { options = {}; }
    this.serialPort = serialPort || (() => {});
    this.timers = {};
    this.source = options.source || 16;
    this.logger = options.logger || (function () {});
    this.running = false;
    this.messageTimeoutLength = options.messageTimeoutLength || 100;
    this.numberOfRetries = options.numberOfRetries || 3;
    this.currentRetries = 0;
    this.timeout;
    this.currentMessage;

    if (serialPort) {
      serialPort.on('data', function (data) {
        data = Message.prototype.stripPacketOfHeaderAndChecksum(data);
        if (this.checkQueueForAcknowledgment(data) === true) {
          if (Message.prototype.isStatusMessage(data)) {
            var pumpData = parsePumpStatus(data);
            logger('status', 'verbose', 'Data Received:  [' + [... data] + ']');
            try {
              socketServer.emit('pumpDataReturn', pumpData);
            } catch (err) {
              logger('system', 'error', 'Error sending pump data via socketIO' + err);
            }
          } else {

          }
          this.currentMessage.callback(null);
        } else {
          logger('events', 'verbose', 'Packet was not an acknowledgment' + data);
        }

      //   if (isStatusMessage(data)) {
      //     var pumpData = parsePumpStatus(data);
      //     logger('status', 'verbose', 'Data Received:  [' + [... data] + ']');
      //     try {
      //       socketServer.emit('pumpDataReturn', pumpData);
      //     } catch (err) {
      //       logger('system', 'error', 'Error sending pump data via socketIO' + err);
      //     }
      //     acknowledgment.status = 'found';
      //   } else if (acknowledgment.status === 'waiting For') {
      //     var check = acknowledgment.isAcknowledgment(data);
      //     acknowledgment.status = 'found';
      //     logger('events', 'verbose', 'Acknowledged:  [' + [... data] + ']');
      //   } else if (Array.isArray(data) === false) {
      //     logger('events', 'debug', 'Data raw: ' + data);

      //   } else {
      //     logger('events', 'verbose', 'Data Received:  [' + [... data] + ']');
      //   }
      //   queue.queueLoopMain();
      });
    }

    // processIncomingSerialPortData);
  }

  add(message) {
    super.add(message);
    if (this.length === 1) {
      this.runQueue();
    }
  }

  sendToSerialPort(message) {
    if (typeof this.serialPort === 'function') {
      this.serialPort(message);
    }
  }

  runQueue () {
    var message = this.currentMessage || this.pull();
    if (!this.currentMessage) {
      message = this.currentMessage = this.pull();
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
    }
    return false;
  }
};