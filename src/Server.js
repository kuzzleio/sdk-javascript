const bluebird = require('bluebird');

/**
 * @class Server
 * @property {Kuzzle} kuzzle - The Kuzzle SDK Instance
 */
class Server {

  /**
   * @constructor
   * @param {Kuzzle} kuzzle - The Kuzzle SDK Instance
   */
  constructor(kuzzle) {
    Object.defineProperty(this, 'kuzzle', {
      value: kuzzle
    });
  }

  /**
   * Checks if an administrator user exists
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Boolean>}
   */
  adminExists(options) {
    return this.kuzzle.query({controller: 'server', action: 'adminExists'}, {}, options)
      .then(res => {
        if (res.result === undefined || typeof res.result.exists !== 'boolean') {
          const error = new Error('adminExists: bad response format');
          error.status = 400;
          error.response = res;
          return bluebird.reject(error);
        }
        return res.result.exists;
      });
  }

  /**
   * Returns all stored statistics frames
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Object>}
   */
  getAllStats(options) {
    return this.kuzzle.query({controller: 'server', action: 'getAllStats'}, {}, options)
      .then(res => res.result);
  }

  /**
   * Returns the Kuzzle configuration
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Object>}
   */
  getConfig(options) {
    return this.kuzzle.query({controller: 'server', action: 'getConfig'}, {}, options)
      .then(res => res.result);
  }

  /**
   * Returns the last statistics frame
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Object>}
   */
  getLastStats(options) {
    return this.kuzzle.query({controller: 'server', action: 'getLastStats'}, {}, options)
      .then(res => res.result);
  }

  /**
   * Returns the statistics frame from a date
   *
   * @param {Number|String} startTime - begining of statistics frame set (timestamp or datetime format)
   * @param {Number|String} stopTime - end of statistics frame set (timestamp or datetime format)
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Object>}
   */
  getStats(startTime, stopTime, options) {
    return this.kuzzle.query({controller: 'server', action: 'getStats'}, {startTime, stopTime}, options)
      .then(res => res.result);
  }

  /**
   * Returns the Kuzzle server information
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Object>}
   */
  info(options) {
    return this.kuzzle.query({controller: 'server', action: 'info'}, {}, options)
      .then(res => res.result);
  }

  /**
   * Get server's current timestamp
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Number>}
   */
  now(options) {
    return this.kuzzle.query({controller: 'server', action: 'now'}, {}, options)
      .then(res => {
        if (res.result === undefined || typeof res.result.now !== 'number') {
          const error = new Error('now: bad response format');
          error.status = 400;
          error.response = res;
          return bluebird.reject(error);
        }
        return res.result.now;
      });
  }
}

module.exports = Server;
