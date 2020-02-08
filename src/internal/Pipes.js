const
  assert = require('assert'),
  waterfall = require('./waterfall');

class Pipes {
  constructor (timeout, actions) {
    this._timeout = timeout;
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
   * The pipe function will be called with a payload that must be returned
   * either directly or by a promise.

   * If an error occur, the pipe function must throw an exception or return a
   * rejected promise.
   *
   * @param {String} actionName - Action name (eg: "kuzzle:query:before")
   * @param {String} description - Pipe description
   * @param {Function} callback - Callback function to attach
   */
  register (actionName, description, callback) {
    const [ , action, position ] = actionName.split(':');

    this._assertActionAllowed(action);
    this._assertScopeAllowed(position);
    assert(typeof callback === 'function', 'Provided pipe must be a valid function.');

    // Wrape the promise based callback into waterfall callback format
    const callbackWrapper = async (data, next) => {
      const timer = setTimeout(() => {
        next(new Error(`Pipe "${description}" on "${actionName}" take more than ${this._timeout}ms to execute. Aborting.`), null);
      }, this._timeout);

      try {
        const res = await callback(data);

        next(null, res);
      }
      catch (error) {
        next(error, null);
      }
      finally {
        clearTimeout(timer);
      }
    };

    this._pipes[action][position].push(callbackWrapper);
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