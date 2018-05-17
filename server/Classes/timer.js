var mixin = {
  start() {
    this._timer = setInterval(this._callback, this._duration);
  },
  stop() {
    clearInterval(this._timer);
    this._timer = null;
  },
  reset() {
    this.stop();
    this.start();
  }
};

module.exports = function Timer (duration, callback, autoStart = true) {
  var myVar = Object.create(mixin);
  if (typeof duration !== 'number' && typeof callback !== 'function') {
    throw new Error('Duration must be a number, and callback must be a function');
  }
  myVar._timer = autoStart ? setInterval(callback, duration) : null;
  myVar._duration = duration;
  myVar._callback = callback;

  return myVar;
};
// Object.assign(module.exports.prototype, mixin);