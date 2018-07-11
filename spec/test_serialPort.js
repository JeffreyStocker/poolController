const chai = require('chai');
const expect = chai.expect;

const SerialPort = require('serialport/test'); // when installed as a package
const sp = require(__dirname + '/../server/communications/serialPort.js'); // when installed as a package
const MockBinding = SerialPort.Binding;

const portPath = 'COM_ANYTHING';

// MockBinding.createPort(portPath, { echo: false, record: false });
const port = new SerialPort(portPath);

describe ('', function () {
  describe ('', function () {
    it('should ', function () {
      expect().to.equal();
    });
  });
});