var _defaultArray = function (time, message, difference) {
  var output = [time, message, difference || 0];
  return output;
};
module.exports = class TimeTracker {
  constructor(name = 'Start') {
    this.start = Date.now();
    this.name = name;
    this.times = [_defaultArray(this.start, 'Start')];
  }

  get last() {
    return this.times[this.times.length - 1];
  }

  mark(message) {
    var time = Date.now();
    this.times.push(_defaultArray(time, message, time - this.last[0]));
  }

  end(message = 'End') {
    var time = Date.now();
    this.times.push(_defaultArray(time, message, time - this.last[0]));
    console.log(this.name + ' Difference:', time - this.start);
  }
  list() {
    returnconsole.table(this.times);
  }
};