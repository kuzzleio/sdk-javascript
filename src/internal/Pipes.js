const
  assert = require('assert'),
  waterfall = require('./waterfall');

class Pipes {
  constructor (actions) {
    this._actions = actions;

    this._pipes = {};

    for (const action of actions) {
      this._pipes[action] = {
        before: [],
        after: []
      };
    }
  }

  /**
   * Registers a new pipe for the specified action.
   *
   * The pipe function will be called with 2 arguments:
   *   - data: object containing pipe data
   *   - cb: callback method to call inside the pipe like this: cb(error, data)
   *
   * @param {String} actionName - Action name and scope (eg: "query:before")
   * @param {Function} pipe - Pipe function to attach
   */
  register (actionName, pipe) {
    const [ action, scope ] = actionName.split(':');

    this._assertActionAllowed(action);
    this._assertScopeAllowed(scope);
    assert(typeof pipe === 'function', 'Provided pipe must be a valid function.');

    this._pipes[action][scope].push(pipe);
  }

  /**
   * Executes pipes registered for an action
   *
   * @param {String} actionName - Action name and scope (eg: "query:before")
   * @param {any} data - Data passed to the callback chain
   */
  execute (actionName, data) {
    const [ action, scope ] = actionName.split(':');

    this._assertActionAllowed(action);
    this._assertScopeAllowed(scope);

    return waterfall(data, this._pipes[action][scope]);
  }

  _assertActionAllowed (action) {
    assert(
      this._actions.includes(action),
      `Action "${action}" is not eligible for pipelining. Available actions: ${this._actions.join(', ')}.`);
  }

  _assertScopeAllowed (scope) {
    assert(
      ['before', 'after'].includes(scope),
      `Scope must be either "before" or "after" (have "${scope}")`);
  }
}

module.exports = Pipes;