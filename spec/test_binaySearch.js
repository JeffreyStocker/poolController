const chai = require('chai');
const expect = chai.expect;
// const sinon = require ('sinon');

const {binarySearch} = require (__dirname + '/../src/vue/binarySearch.js');

describe ('binarySearch', function () {
  var testArrayEven, testArrayOdd;
  before (function () {
    testArrayEven = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    testArrayOdd = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  });
  describe ('should return the last if test function always is set to 1', function () {
    it('should return last position', function () {
      expect(binarySearch (testArrayEven, function (val) { return 10 - val; })).to.equal(testArrayEven.length - 1);
      expect(binarySearch (testArrayOdd, function (val) { return 11 - val; })).to.equal(testArrayOdd.length - 1);
    });

    it ('should return first position', function () {
      var testVal = 1;
      expect(binarySearch (testArrayEven, function (val) { return testVal - val; })).to.equal(0);
      expect(binarySearch (testArrayOdd, function (val) { return testVal - val; })).to.equal(0);
    });

    it ('should return the correct position for Each position in the array', function () {
      for (let i = 0; i < testArrayEven.length; i++) {
        expect(binarySearch (testArrayEven, function (val) { return testArrayEven[i] - val; })).to.equal(i);
      }
      for (let i = 0; i < testArrayOdd.length; i++) {
        expect(binarySearch (testArrayOdd, function (val) { return testArrayOdd[i] - val; })).to.equal(i);
      }
    });

    it ('should return null for value too high', function () {
      var testVal = 99;
      expect(binarySearch (testArrayEven, function (val) { return testVal - val; })).to.equal(null);
      expect(binarySearch (testArrayOdd, function (val) { return testVal - val; })).to.equal(null);
    });

    it ('should return null for value too low', function () {
      var testVal = -1;
      expect(binarySearch (testArrayEven, function (val) { return testVal - val; })).to.equal(null);
      expect(binarySearch (testArrayOdd, function (val) { return testVal - val; })).to.equal(null);
    });

    it ('should return correct values with a array with decimial', function () {
      var testArrayEven = [1, 2, 3, 4, 5.5, 6, 7, 8, 9, 10];
      var testVal = -1;

      expect(binarySearch (testArrayEven, function (val) { return testVal - val; })).to.equal(null);

      testVal = 11;
      expect(binarySearch (testArrayEven, function (val) { return testVal - val; })).to.equal(null);

      testVal = 5;
      expect(binarySearch (testArrayEven, function (val) { return testVal - val; })).to.equal(null);

      testVal = 6;
      expect(binarySearch (testArrayEven, function (val) { return testVal - val; })).to.equal(5);

      testVal = 5.5;
      expect(binarySearch (testArrayEven, function (val) { return testVal - val; })).to.equal(4);
    });

    it ('should return correct values with a array with negatives', function () {
      var testArrayEven = [-10, -9, -5, -2, -1, 0, 1, 2, 3, 4, 5.5, 6, 7, 8, 9, 10];
      var testVal = -1;
      expect(binarySearch (testArrayEven, function (val) { return testVal - val; })).to.equal(4);

      var testVal = -100;
      expect(binarySearch (testArrayEven, function (val) { return testVal - val; })).to.equal(null);

      testVal = 11;
      expect(binarySearch (testArrayEven, function (val) { return testVal - val; })).to.equal(null);

      testVal = 5;
      expect(binarySearch (testArrayEven, function (val) { return testVal - val; })).to.equal(null);

      testVal = 6;
      expect(binarySearch (testArrayEven, function (val) { return testVal - val; })).to.equal(11);

      testVal = 5.5;
      expect(binarySearch (testArrayEven, function (val) { return testVal - val; })).to.equal(10);
    });

  });
});