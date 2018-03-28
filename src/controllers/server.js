const _kuzzle = Symbol();

/**
 * @class ServerController
 * @property {Kuzzle} kuzzle - The Kuzzle SDK Instance
 */
class ServerController {

  /**
   * @param {Kuzzle} kuzzle - The Kuzzle SDK Instance
   */
  constructor (kuzzle) {
    this[_kuzzle] = kuzzle;
  }

  get kuzzle () {
    return this[_kuzzle];
  }

  /**
   * Checks if an administrator user exists
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Boolean>}
   */
  adminExists (options) {
    return this.kuzzle.query({
      controller: 'server',
      action: 'adminExists'
    }, options)
      .then(result => result.exists);
  }


  /**
   * Returns all stored statistics frames
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Object>}
   */
  getAllStats (options) {
    return this.kuzzle.query({
      controller: 'server',
      action: 'getAllStats'
    }, options);
  }

  /**
   * Returns the Kuzzle configuration
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Object>}
   */
  getConfig (options) {
    return this.kuzzle.query({
      controller: 'server',
      action: 'getConfig'
    }, options);
  }

  /**
   * Returns the last statistics frame
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Object>}
   */
  getLastStats (options) {
    return this.kuzzle.query({
      controller: 'server',
      action: 'getLastStats'
    }, options);
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
    return this.kuzzle.query({
      controller: 'server',
      action: 'getStats',
      startTime,
      stopTime
    }, options);
  }

  /**
   * Returns the Kuzzle server information
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Object>}
   */
  info (options) {
    return this.kuzzle.query({
      controller: 'server',
      action: 'info'
    }, options);
  }

  /**
   * Get server's current timestamp
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Number>}
   */
  now (options) {
    return this.kuzzle.query({
      controller: 'server',
      action: 'now'
    }, options)
      .then(result => result.now);
  }
}

module.exports = ServerController;
