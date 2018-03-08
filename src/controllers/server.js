class ServerController {

  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    this.kuzzle = kuzzle;
  }

  adminExists (options) {
    return this.kuzzle.query({
      controller: 'server',
      action: 'adminExists'
    }, undefined, options)
      .then(result => result.exists);
  }

  getAllStats (options) {
    return this.kuzzle.query({
      controller: 'server',
      action: 'getAllStats'
    }, undefined, options);
  }

  getConfig (options) {
    return this.kuzzle.query({
      controller: 'server',
      action: 'getConfig'
    }, undefined, options);
  }

  getLastStats (options) {
    return this.kuzzle.query({
      controller: 'server',
      action: 'getLastStats'
    }, undefined, options);
  }

  info (options) {
    return this.kuzzle.query({
      controller: 'server',
      action: 'info'
    }, undefined, options);
  }

  now (options) {
    return this.kuzzle.query({
      controller: 'server',
      action: 'now'
    }, undefined, options);
  }
}

module.exports = ServerController;
