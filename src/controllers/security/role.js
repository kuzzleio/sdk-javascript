let _kuzzle;

class Role {

  /**
   * @param {Kuzzle} kuzzle
   * @param {Object} data
   */
  constructor (kuzzle, _id = null, controllers = {}) {
    _kuzzle = kuzzle;

    this._id = _id;
    this.controllers = controllers;
  }

  get kuzzle () {
    return _kuzzle;
  }
}

module.exports = Role;

