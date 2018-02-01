var stack = require('./TwinLinkedStack');
class Queue extends stack {
  constructor (config = {actions: {}, data: undefined, } ) {
    super(data);

    if (typeof config !== 'object' ) { throw 'Config mush be set to an action'; }
    this._InUse = false;
    this._started = false;
    this._actions = config.actions;
    this.timer;
  }

  runAction(name) {
    var action = this_actions[name];
    if (typeof action === 'function') {
      return action();
    }
    return action;
  }

  setAction (name, action) {
    this._actions[name] = action;
  }

  pull () {
    if (this._InUse && this.length === 0) {
      this._InUse = false;
      if (this._actions.empty !== undefined) {
        return this.runAction('empty');
      } else {
        return undefined;
      }
    } else if (this._InUse) {
      return this.shift();
    } else if (!this._InUse && this.length === 0) {
      return undefined;
    } else if (!this._InUse) {
      this._InUse = true;
      // console.log ('start', this._startAction)
      if (this._actions.start !== undefined) {
        return this.runAction('start');
      }
      return this.shift();
    }
    return null;
  }

  peak () {
    if (this.head === null) {
      return;
    }
    return this.head.val;
  }
  add(value) {
    this.push(value);
    if (this._actions.start !== undefined) {
      return this.runAction('add');
    }
  }
}