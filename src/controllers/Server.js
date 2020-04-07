const BaseControler = require('./Base');

/**
 * @class ServerController
 * @property {Kuzzle} kuzzle - The Kuzzle SDK Instance
 */
class ServerController extends BaseControler {

  /**
   * @param {Kuzzle} kuzzle - The Kuzzle SDK Instance
   */
  constructor (kuzzle) {
    super(kuzzle, 'server');
  }

  /**
   * Checks if an administrator user exists
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Boolean>}
   */
  adminExists (options) {
    return this.query({
      action: 'adminExists'
    }, options)
      .then(response => {
        if (typeof response.result !== 'object' || typeof response.result.exists !== 'boolean') {
          const error = new Error('adminExists: bad response format');
          error.status = 400;
          error.response = response;
          return Promise.reject(error);
        }
        return response.result.exists;
      });
  }


  /**
   * Returns all stored statistics frames
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Object>}
   */
  getAllStats (options) {
    return this.query({
      action: 'getAllStats'
    }, options)
      .then(response => response.result);
  }

  /**
   * Returns the Kuzzle configuration
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Object>}
   */
  getConfig (options) {
    return this.query({
      action: 'getConfig'
    }, options)
      .then(response => response.result);
  }

  /**
   * Returns the last statistics frame
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Object>}
   */
  getLastStats (options) {
    return this.query({
      action: 'getLastStats'
    }, options)
      .then(response => response.result);
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
    return this.query({
      action: 'getStats',
      startTime,
      stopTime
    }, options)
      .then(response => response.result);
  }

  /**
   * Returns the Kuzzle server information
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Object>}
   */
  info (options) {
    return this.query({
      action: 'info'
    }, options)
      .then(response => response.result);
  }

  /**
   * Get server's current timestamp
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Number>}
   */
  now (options) {
    return this.query({
      action: 'now'
    }, options)
      .then(response => {
        if (typeof response.result !== 'object' || typeof response.result.now !== 'number') {
          const error = new Error('now: bad response format');
          error.status = 400;
          error.response = response;
          return Promise.reject(error);
        }
        return response.result.now;
      });
  }
}

module.exports = ServerController;
