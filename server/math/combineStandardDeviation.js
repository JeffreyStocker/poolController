//https://en.wikipedia.org/wiki/Pooled_variance
module.exports = function () {
  var divisor = topSum = totalCount = 0;
  return {
    add: function (standardDeviation, count) {
      if (typeof standardDeviation !== 'number' ) {
        throw new Error ('standard deviation variable should be a number');
      } else if (typeof count !== 'number') {
        throw new Error ('count should be a number');
      } else if (count < 0) {
        throw new Error ('count should be positive number');
      }
      let adjustedCount = count - 1;
      totalCount += count;
      divisor += adjustedCount;
      topSum += adjustedCount * Math.pow(standardDeviation, 2);
    },
    equal: function () {
      return Math.pow(topSum / divisor, 0.5);
    }
  };
};