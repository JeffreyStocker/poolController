module.exports = class TimeTracker {
  constructor(message) {
    this.start = Date.now();
    this.times = [[this.start, message]];
  }

  mark(message) {
    this.times.push([Date.now(), message]);
  }

  end(message) {
    this.end = Date.now();
    this.times.push([this.end, message]);
    console.log('Total Time Difference:', this.end - this.start);
  }
};