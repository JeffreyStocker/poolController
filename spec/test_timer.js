var Timer = require('../server/classes/Timer.js');

var assert = require('assert');
var chai = require('chai');
var expect = chai.expect();
var should = chai.should();

describe ('Timer', function ( ) {
  describe ('Method Start', function ( ) {
    it('should have a method start', function () {
      var timer = new Timer(1000, function () {}, false);
      timer.should.have.property('start');
      timer.start.should.be.a('function');
    });

    it('should run for at least 100 ms', function (done) {
      var startTime = Date.now();
      var timer = new Timer(100, function () {
        var endTime = Date.now();
        if (endTime - startTime >= 100) {
          done();
        } else {
          done ('Was not 1000ms');
        }
        this.stop();
      });
    });

  });
  describe ('Method Stop', function ( ) {
    it ('should have a stop method', function () {
      var timer = new Timer(100, function () {
      }, false);
      timer.stop.should.be.a('function');
      timer.should.have.property('stop');
    });
    it('should stop a running timer', function (done) {
      var timer = new Timer (100, function () {
        done('timer completed');
      });
      timer.stop();
      // expect(timer._timer).be.undefined;
      setTimeout(() => {
        done();
      }, 150);
    });
  });

  describe ('Method Reset', function ( ) {
    it ('should have a Reset method', function () {
      var timer = new Timer(100, function () {
      }, false);
      timer.reset.should.be.a('function');
      timer.should.have.property('reset');
    });

    it('should restart a timer', function (done) {
      var timeout = setTimeout(() => {
        done('Should have not run');
      }, 150);
      var timer = new Timer (100, function () {
        timer.stop();
        clearTimeout(timeout);
        done();
      });
      timer.stop();
      timer.reset();
    });
  });

  describe ('Method setDuration', function () {
    it('should change _duration to 20ms', function (done) {
      var timer = new Timer(100, function () {
        timer.stop();
        done();
      });
      timer.setDuration(20);
      timer._duration.should.equal(20);
    });

    it('should change run for at least 20ms, but not more than 25ms', function (done) {
      var startTime, endTime;
      var timer = new Timer(100, function () {
        endTime = Date.now();
        (endTime - startTime).should.greaterThan(19);
        (endTime - startTime).should.lessThan(25);
        timer.stop();
        done();
      });
      startTime = Date.now();
      timer.setDuration(20);
    });
  });

  describe ('Method setFunction', function () {
    it ('should change function to new function', function (done) {
      var timer = new Timer(10, function () {
        timer.stop();
        done('wrong function');
      });

      timer.setFunction(function () {
        timer.stop();
        done();
      });
    });
  });

});