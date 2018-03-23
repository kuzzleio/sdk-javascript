let _kuzzle;

class ServerController {

  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    _kuzzle = kuzzle;
  }

  get kuzzle () {
    return _kuzzle;
  }

  adminExists (options) {
    return this.kuzzle.query({
      controller: 'server',
      action: 'adminExists'
    }, options)
      .then(result => result.exists);
  }

  getAllStats (options) {
    return this.kuzzle.query({
      controller: 'server',
      action: 'getAllStats'
    }, options);
  }

  getConfig (options) {
    return this.kuzzle.query({
      controller: 'server',
      action: 'getConfig'
    }, options);
  }

  getLastStats (options) {
    return this.kuzzle.query({
      controller: 'server',
      action: 'getLastStats'
    }, options);
  }

  info (options) {
    return this.kuzzle.query({
      controller: 'server',
      action: 'info'
    }, options);
  }

  now (options) {
    return this.kuzzle.query({
      controller: 'server',
      action: 'now'
    }, options)
      .then(result => result.now);
  }
}

module.exports = ServerController;
