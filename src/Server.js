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
    return this.kuzzle.queryPromise({controller: 'server', action: 'adminExists'}, {}, options)
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
    return this.kuzzle.queryPromise({controller: 'server', action: 'getAllStats'}, {}, options)
      .then(res => res.result);
  }
}

module.exports = Server;
