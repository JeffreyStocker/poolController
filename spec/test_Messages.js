process.env.NODE_PATH = __dirname + '/../';
var glob = require(process.env.NODE_PATH + '/requireGlob').init(['node_modules', 'spec', 'testingRandomStuff', 'public', 'logs']);

var msg = require('../server/equipment/Pentair/PentairMessages');
var Message = msg.Message;
var assert = require('assert');
var chai = require('chai');
var should = chai.should();

describe('Should be a Message Class', function () {
  var message;
  beforeEach (function () {
    message = undefined;
  });
  describe('should contain the correct properties', function () {
    it('should contain properties names', function () {
      message = new Message([165, 0, 96, 16, 4, 1, 255]);
      message.should.have.property('originalPacket');
      message.should.have.property('name');
      message.should.have.property('logLevel');
      message.should.have.property('destination');
      message.should.have.property('source');
      message.should.have.property('acknowledgment');
      message.should.have.property('timers');
      message.should.have.property('callback');
    });
  });

  describe('Should be have methods', function () {
    it('should contain method "sumOfBytes"', function () {
      message = new Message([165, 0, 96, 16, 4, 1, 255]);
      message.should.have.property('sumOfBytes');
      var sum = message.sumOfBytes([0]);
      sum.should.equal(0);
      sum = message.sumOfBytes([0, 0, 0, 0]);
      sum.should.equal(0);
      sum = message.sumOfBytes([258, 1, 21, 9]);
      sum.should.equal(289);
    });

    it('should contain method "packet"', function () {
      message = new Message([165, 0, 96, 16, 4, 1, 255]);
      message.should.have.property('packet');
      var packet = message.packet;
      packet.should.eql([255, 0, 255, 165, 0, 96, 16, 4, 1, 255, 2, 25]);
    });


    it('should contain method "appendCheckSum"', function () {
      Message.prototype.should.have.property('appendCheckSum');
    });

    it('should contain method "combineHighPlusLowBit"', function () {
      Message.prototype.should.have.property('combineHighPlusLowBit');
      Message.prototype.combineHighPlusLowBit(0, 0).should.equal(0);
      Message.prototype.combineHighPlusLowBit(1, 0).should.equal(256);
      Message.prototype.combineHighPlusLowBit(0, 1).should.equal(1);
      Message.prototype.combineHighPlusLowBit(5, 35).should.equal(1315);
      should.throw(() => {
        Message.prototype.combineHighPlusLowBit(5, '35t');
      });
      should.throw(() => {
        Message.prototype.combineHighPlusLowBit(5, [35, 5]);
      });
      should.throw(() => {
        Message.prototype.combineHighPlusLowBit('test', 4);
      });
      should.throw(() => {
        Message.prototype.combineHighPlusLowBit([4, 5], 4);
      });
    });

    // it('should contain method "flipSourceAndDestination"', function () {
    // });

    it('should contain method "findStart"', function () {
      Message.prototype.should.have.property('findStart');
      let startWithHeader = Message.prototype.findStart([255, 0, 255, 165, 0, 96, 16, 4, 1, 255, 2, 25]);
      startWithHeader.should.be.equal(3);

      let startWithoutHeader = Message.prototype.findStart([165, 0, 96, 16, 4, 1, 255, 2, 25]);
      startWithoutHeader.should.be.equal(0);

      let missingStart = Message.prototype.findStart([0, 96, 16, 4, 1, 255, 2, 25]);
      missingStart.should.be.equal(-1);

      let corruptStart1stByte = Message.prototype.findStart([164, 0, 96, 16, 4, 1, 255, 2, 25]);
      corruptStart1stByte.should.be.equal(-1);

      let corruptStart2ndByte = Message.prototype.findStart([165, 1, 96, 16, 4, 1, 255, 2, 25]);
      corruptStart2ndByte.should.be.equal(-1);

      should.throw(() => {
        Message.prototype.findStart('test');
      });

      should.throw(() => {
        Message.prototype.findStart({test: [165, 0]});
      });

      let canHaveOtherTypesInArray = Message.prototype.findStart([165, 0, {test: 'yes'}, 96, 'test', 4, 1, 'nope', [2, 5, 'test'], 25]);
      canHaveOtherTypesInArray.should.be.equal(0);

    });

    //   // need to be fixed
    // it('should contain method "hasHeader"', function () {
    //   message = new Message([165, 0, 96, 16, 4, 1, 255]);
    //   message.should.have.property('hasHeader');
    //   let result = message.hasHeader([255, 0, 255, 165, 0, 96, 16, 4, 1, 255]);
    //   result.should.equal(true);
    //   // result = message.hasHeader([255, 0, 253, 165, 0, 96, 16, 4, 1, 255]);
    //   // result.should.equal(false);
    // });


    // it('should contain method "isAcknowledgment"', function () {
    // });

    // it('should contain method "isStatusMessage"', function () {
    // });

    // it('should contain method "isHexString"', function () {
    // });

    // it('should contain method "isValidPacket"', function () {
    // });

    // it('should contain method "isValidStrippedPacket"', function () {
    // });

    // it('should contain method "parsePumpStatus"', function () {
    // });

    // it('should contain method "prependBuffer"', function () {
    // });

    // it('should contain method "prependStart"', function () {
    // });

    // it('should contain method "preparePacketForSending"', function () {
    // });

    // it('should contain method "processIncomingPacket"', function () {
    // });

    // it('should contain method "returnAcknowledgmentFromPacket"', function () {
    // });

    // it('should contain method "returnArrayFromBuffer"', function () {
    // });

    // it('should contain method "returnLengthByte"', function () {
    // });

    it('should contain method "returnHighBit"', function () {
      Message.prototype.should.have.property('returnHighBit');
      Message.prototype.returnHighBit(256).should.equal(1);
      Message.prototype.returnHighBit(1280).should.equal(5);
      Message.prototype.returnHighBit(6149).should.equal(24);
      Message.prototype.returnHighBit(10000).should.equal(39);

      assert(Message.prototype.returnHighBit(-10000) === null);
      assert(Message.prototype.returnHighBit('test') === null);
      assert(Message.prototype.returnHighBit([2]) === null);
      assert(Message.prototype.returnHighBit({test: true}) === null);
    });

    it('should contain method "returnLowBit"', function () {
      Message.prototype.should.have.property('returnLowBit');
      Message.prototype.returnLowBit(256).should.equal(0);
      Message.prototype.returnLowBit(1280).should.equal(0);
      Message.prototype.returnLowBit(6149).should.equal(5);
      Message.prototype.returnLowBit(10000).should.equal(16);

      assert(Message.prototype.returnLowBit(-10000) === null);
      assert(Message.prototype.returnLowBit('test') === null);
      assert(Message.prototype.returnLowBit([2]) === null);
      assert(Message.prototype.returnLowBit({test: true}) === null);
    });

    it('should contain method "returnChecksum"', function () {
      Message.prototype.should.have.property('returnChecksum');
      Message.prototype.returnChecksum([165, 0, 96, 16, 4, 1, 255]).should.eql([2, 25]);
      Message.prototype.returnChecksum([165, 0, 96, 16, 1, 4, 3, 33, 0, 32]).should.eql([1, 94]);
      Message.prototype.returnChecksum([165, 0, 96, 16, 1, 4, 3, 33, 0, 24]).should.eql([1, 86]);
      Message.prototype.returnChecksum([165, 0, 96, 16, 1, 4, 3, 33, 0, 8]).should.eql([1, 70]);
      Message.prototype.returnChecksum([165, 0, 96, 16, 1, 4, 3, 33, 0, 0]).should.eql([1, 62]);
      Message.prototype.returnChecksum([165, 0, 96, 16, 5, 1, 1]).should.eql([1, 28]);
      Message.prototype.returnChecksum([165, 0, 96, 16, 5, 1, 2]).should.eql([1, 29]);
      Message.prototype.returnChecksum([165, 0, 96, 16, 4, 1, 255]).should.eql([2, 25]);
      Message.prototype.returnChecksum([165, 0, 96, 16, 4, 1, 0]).should.eql([1, 26]);
      Message.prototype.returnChecksum([165, 0, 96, 16, 4, 1, 1]).should.not.eql([1, 26]);
    });

    // it('should contain method "setDestAndSource"', function () {
    // });

    // it('should contain method "setDestination"', function () {
    // });

    // it('should contain method "setSource"', function () {
    // });

    // it('should contain method "sliceStringByRecurringAmounts"', function () {
    // });

    // it('should contain method "stripPacketOfHeaderAndChecksum"', function () {
    // });

    // it('should contain method "stripPacket"', function () {
    // });

    // it('should contain method "stripHeader"', function () {
    // });

    // it('should contain method "stripchecksum"', function () {
    // });

    it('should contain method "sumOfBytes"', function () {
      Message.prototype.should.have.property('returnChecksum');
      Message.prototype.sumOfBytes([165, 0, 96, 16, 4, 1, 255]).should.eql(537);
      Message.prototype.sumOfBytes([165, 0, 96, 16, 1, 4, 3, 33, 0, 32]).should.eql(350);
      Message.prototype.sumOfBytes([165, 0, 96, 16, 1, 4, 3, 33, 0, 24]).should.eql(342);
      Message.prototype.sumOfBytes([165, 0, 96, 16, 1, 4, 3, 33, 0, 8]).should.eql(326);
      Message.prototype.sumOfBytes([165, 0, 96, 16, 1, 4, 3, 33, 0, 0]).should.eql(318);
      Message.prototype.sumOfBytes([165, 0, 96, 16, 5, 1, 1]).should.eql(284);
      Message.prototype.sumOfBytes([165, 0, 96, 16, 5, 1, 2]).should.eql(285);
      Message.prototype.sumOfBytes([165, 0, 96, 16, 4, 1, 255]).should.eql(537);
      Message.prototype.sumOfBytes([165, 0, 96, 16, 4, 1, 0]).should.eql(282);
      Message.prototype.sumOfBytes([165, 0, 96, 16, 4, 1, 1]).should.eql(283);
      assert(Message.prototype.sumOfBytes([165, 0, 'test', 16, 4, 1, 1]) === null);
      assert(Message.prototype.sumOfBytes([165, 0, [5, 3, 2], 16, 4, 1, 1]) === null);
      assert(Message.prototype.sumOfBytes([165, 0, {test: 5}, 16, 4, 1, 1]) === null);
      assert(Message.prototype.sumOfBytes('test') === null);
      assert(Message.prototype.sumOfBytes(543) === null);
      assert(Message.prototype.sumOfBytes(function() { var test = 5; } ) === null);
      assert(Message.prototype.sumOfBytes({test: 'this is a test'} ) === null);
    });

    // it('should contain method "tryAcknowledgment"', function () {
    // });

  });




  // it('should contain method "hasHeader"', function () {

  // });

  // it('should contain method "hasHeader"', function () {

  // });

  // it('should contain method "hasHeader"', function () {

  // });

  // it('should contain method "hasHeader"', function () {

  // });



});