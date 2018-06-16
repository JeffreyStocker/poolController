module.exports = class Average {
  constructor() {
    this.sum = 0;
    this.count = 0;
  }
  addDataPoint (data) {
    this.sum += data;
    this.count++;
  }
  return () {
    if (count === 0) {
      return 0;
    }
    return sum / count;
  }
};