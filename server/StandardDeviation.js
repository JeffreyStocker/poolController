module.exports = class StandardDeviation {
  constructor(initDataArray) {
    this._dataPoints = [];
    initDataArray && this.addDataPoints(initDataArray);
  }

  addDataPoint (data) {
    if (typeof data !== 'number') {
      throw new Error ('Input data should be a number');
    }
    this._dataPoints.push(data);
  }

  addDataPoints (dataArray) {
    if (!Array.isArray(dataArray)) {
      throw new Error ('Input data should be a array');
    }
    dataArray.forEach(val => this.addDataPoint(val));
  }

  return (average) {
    if (!average) {
      average = this._dataPoints.reduce((sum, val) => sum + val, 0) / this._dataPoints.length;
    }
    var variances = this._dataPoints.map(val => Math.pow(val - average, 2));
    var sumOfvariances = variances.reduce((sum, elementVal) => sum + elementVal, 0);
    return Math.sqrt(sumOfvariances / this._dataPoints.length);
  }
};