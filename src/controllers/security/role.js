class Role {

  /**
   * @param {Kuzzle} kuzzle
   * @param {Object} data
   */
  constructor (kuzzle, _id = null, controllers = {}) {
    Reflect.defineProperty(this, '_kuzzle', {
      writable: true,
      value: kuzzle
    });

    this._id = _id;
    this.controllers = controllers;
  }

  get kuzzle () {
    return this._kuzzle;
  }
}

module.exports = Role;

