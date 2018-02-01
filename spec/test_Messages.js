var Message = require('../server/Classes/Message.js');
var assert = require('assert');
var fs = require('fs');
var chai = require('chai');
chai.should();
describe('Should be a Message Class', function () {
  var message;
  beforeEach (function () {
    message = new Message();
  });
  it('should contain the correct properties', function () {
    message.should.have.property('message');
    message.should.have.property('name');
    message.should.have.property('originalMessage');
    message.should.have.property('retryAttempts');
  });
  it('should contain method sumOfBytes that works correctly', function () {
    message.should.have.property('sumOfBytes');
    var sum = message.sumOfBytes([0]);
    console.log ('sum', sum);
    sum.should.equal(0);
  });
});