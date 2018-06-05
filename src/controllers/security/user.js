let
  _kuzzle;

class User {
  /**
   *
   * @param {Kuzzle} kuzzle
   * @param {Object} data
   */
  constructor (kuzzle, _id = null, content = {}, meta = {}) {
    _kuzzle = kuzzle;

    this._id = _id;
    this.content = content;
    this.meta = meta;
  }

  get kuzzle () {
    return _kuzzle;
  }

  get profileIds () {
    return this.content.profileIds || [];
  }

  /**
   * @returns {Promise<[Profile]>}
   */
  getProfiles () {
    if (!this.profileIds || this.profileIds.length === 0) {
      return Promise.resolve([]);
    }
    return this.kuzzle.security.mGetProfiles(this.profileIds);
  }

}

module.exports = User;

