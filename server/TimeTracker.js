var _defaultArray = function (time, message) {
  return [time, message];
};
module.exports = class TimeTracker {
  constructor(message) {
    this.start = Date.now();
    this.times = [_defaultArray(this.start, message)];
  }

  mark(message) {
    this.times.push(Date.now(), _defaultArray(message));
  }

  end(message) {
    this.end = Date.now();
    this.times.push(this.end, _defaultArray(message));
    console.log('Total Time Difference:', this.end - this.start);
  }
};