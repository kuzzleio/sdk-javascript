class ServerController {

  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    this.kuzzle = kuzzle;
  }

  adminExists () {
    return this.kuzzle.query({
      controller: 'server',
      action: 'adminExists'
    })
      .then(result => result.exists);
  }

  getAllStats () {
    return this.kuzzle.query({
      controller: 'server',
      action: 'getAllStats'
    });
  }

  getConfig () {
    return this.kuzzle.query({
      controller: 'server',
      action: 'getConfig'
    });
  }

  getLastStats () {
    return this.kuzzle.query({
      controller: 'server',
      action: 'getLastStats'
    });
  }

  info () {
    return this.kuzzle.query({
      controller: 'server',
      action: 'info'
    });
  }

  now () {
    return this.kuzzle.query({
      controller: 'server',
      action: 'now'
    });
  }
}

module.exports = ServerController;
