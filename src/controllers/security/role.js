let _kuzzle;

class Role {

  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    _kuzzle = kuzzle;

    this._id = null;
    this.controllers = {};
  }

  get kuzzle () {
    return _kuzzle;
  }
}

module.exports = Role;

