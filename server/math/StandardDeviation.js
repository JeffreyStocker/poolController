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

  return ({average = undefined, type = 'population'} = {type: 'population'}) {
    var variances, sumOfvariances;
    if (!average) {
      var sum = this._dataPoints.reduce((sum, val) => sum + val, 0);
      average = sum / this._dataPoints.length;
    }

    variances = this._dataPoints.map(val => Math.pow(val - average, 2));
    sumOfvariances = variances.reduce((sum, elementVal) => sum + elementVal, 0);

    if (this._dataPoints.length === 0 || this._dataPoints.length === 1) {
      return 0;
    }

    if (type === 'population') {
      return Math.pow(sumOfvariances / this._dataPoints.length, 0.5);

    } else if (type === 'sample') {
      return Math.pow(sumOfvariances / (this._dataPoints.length - 1), 0.5);

    } else {
      throw new Error ('type variable must be "population" or "sample"');
    }
  }
};