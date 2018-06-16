const chai = require('chai');
const expect = chai.expect;
const PoolSD = require (__dirname + '/../../server/math/combineStandardDeviation');
// const fs = require('fs');
// const sinon = require ('sinon');

describe ('combineStandardDeviation', function () {
  it('should equal 7.90569415', function () {
    var pooled = new PoolSD();
    pooled.add(10, 100);
    pooled.add(5, 100);
    expect(Number(pooled.equal().toFixed(8))).to.equal(7.90569415);
  });

  it('should handle decimal for standard deviation', function () {
    var pooled = new PoolSD();
    pooled.add(10.215, 128);
    pooled.add(57.365, 238);
    expect(Number(pooled.equal().toFixed(13))).to.equal(46.6798223021986);
  });

  it ('should handle negative standard deviation numbers', function () {
    var pooled = new PoolSD();
    pooled.add(-10, 100);
    pooled.add(-5, 100);
    expect(Number(pooled.equal().toFixed(8))).to.equal(7.90569415);
  });

  it ('should throw using non numbers for standard deviation', function () {
    var pooled = new PoolSD();
    expect(pooled.add.bind(null, '10', 100)).to.throw();
    expect(pooled.add.bind(null, '2', 100)).to.throw();
  });

  it ('should throw when using non numbers for count', function () {
    var pooled = new PoolSD();
    pooled.add(10, 100);
    expect(pooled.add.bind(null, 5, 'test')).to.throw();
  });

  it ('should throw when using negative numbers for count', function () {
    var pooled = new PoolSD();
    pooled.add(10, 100);
    expect(pooled.add.bind(null, 5, -100)).to.throw();
  });
});

// C:\Dropbox\PScripts\Pool App\app\server\math\combineStandardDeviation.js