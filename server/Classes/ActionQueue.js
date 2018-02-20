var TwinLinkedStack = require(process.env.NODE_PATH + '/server/Classes/TwinLinkedStack');

module.exports = class ActionQueue extends TwinLinkedStack {
  constructor (config = {actions: {}, data: undefined, } ) {
    super();

    if (typeof config !== 'object' ) { throw 'Config mush be set to an action'; }

    this._InUse = false;
    this._started = false;
    this._actions = config.actions || {};
  }

  runAction(name, context = this) {
    var action = this_actions[name];
    if (typeof action === 'function') {
      return action().bind(this);
    }
    return action;
  }

  setAction (name, action) {
    this._actions[name] = action;
  }

  pull () {
    if (this._InUse && this.length === 0) {
      this._InUse = false;
      return this.runAction('empty', this);
    } else if (this._InUse) {
      return this.shift();
    } else if (!this._InUse && this.length === 0) {
      return undefined;
    } else if (!this._InUse) {
      this._InUse = true;
      return this.runAction('start', this);
    }
    return null;
  }

  add(message) {
    this.push(message);
    return this.runAction('add');
    // if (this._actions.start !== undefined) {
    // }
  }
};