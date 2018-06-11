var mixin = {
  start() {
    if (!this._timer) {
      this._timer = setInterval(() => {
        this._callback();
      }, this._duration);
    }
    return this._timer;
  },
  stop() {
    clearInterval(this._timer);
    this._timer = null;
  },
  reset() {
    this.stop();
    this.start();
  },
  setDuration (time) {
    if (typeof time !== 'number') { throw new Error ('time:', time, 'should be a number'); }
    if (typeof time > 0) { throw new Error ('time:', time, 'should be postive'); }
    this._duration = time;
    this.reset();
  },
  setFunction (newFunc) {
    if (typeof newFunc !== 'function') { throw new Error ('should be a function'); }
    this._callback = newFunc;
    this.reset();
  },
};

module.exports = function Timer (duration, callback, autoStart = true) {
  var myVar = Object.create(mixin);

  typeof duration !== 'object' && new Error('Duration must be a number');
  typeof callback !== 'function' && new Error('Callback must be a function');

  myVar._duration = duration;
  myVar._callback = callback;
  myVar._context = this;
  myVar._timer = autoStart ? myVar.start() : null;

  return myVar;
};