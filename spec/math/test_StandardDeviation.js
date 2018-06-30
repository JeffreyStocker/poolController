var StandardDeviation = require(__dirname + '/../../server/math/StandardDeviation.js');
// var assert = require('assert');
var chai = require('chai');
var should = chai.should();
const MathUtils = require('../../server/math/MathUtils.js');

describe ('Standard Deviation function', function ( ) {
  it('should create a new object ', function () {
    var sd = new StandardDeviation();
    should.exist(sd);
    sd.constructor.name.should.equal('StandardDeviation');
  });

  it ('should have method _dataPoints', function () {
    var sd = new StandardDeviation();
    sd.should.have.property('_dataPoints');
    sd._dataPoints.should.be.a('array');
  });


  it ('should have method addDataPoint', function () {
    var sd = new StandardDeviation();
    sd.should.have.property('addDataPoint');
    sd.addDataPoint(1);
    sd.addDataPoint(2);
    sd.addDataPoint(3);
    sd._dataPoints.should.eql([1, 2, 3]);
    should.throw(() => {
      sd.addDataPoint('Not a Number');
    });
    should.throw(() => {
      sd.addDataPoint(() => {});
    });

  });

  it ('should have method addDataPoints', function () {
    var sd = new StandardDeviation();
    sd.should.have.property('addDataPoints');

    sd.addDataPoints([1, 2, 3]);
    sd._dataPoints.should.be.eql([1, 2, 3]);

    should.throw(() => {
      sd.addDataPoints(['not', 'a', 'number']);
    });
    should.throw(() => {
      sd.addDataPoints({test: 5});
    });
    should.throw(() => {
      sd.addDataPoints(() => {});
    });
  });

  describe ('return', function ( ) {
    it('should have method return', function () {
      var sd = new StandardDeviation();
      sd.should.have.property('return');
      sd.return.should.be.a('function');
    });

    it ('should return a standard deviation of zero', function () {
      var sd = new StandardDeviation();
      sd.addDataPoints([10, 10, 10]);
      sd.return().should.be.equal(0);
    });

    it ('should return a standard deviation of 12.18349293', function () {
      var sd = new StandardDeviation();
      sd.addDataPoints([100, 110, 100, 90, 100, 100, 120, 130]);
      Math.betterRound(sd.return(), 8).should.be.equal(12.18349293);
    });

    it ('should return a stadard deviation of 81.6496580927726', function () {
      var sd = new StandardDeviation();
      sd.addDataPoints([100, 200, 300, 100, 200, 300]);
      Math.betterRound(sd.return(), 13).should.be.equal(81.6496580927726);
    });

  });
});