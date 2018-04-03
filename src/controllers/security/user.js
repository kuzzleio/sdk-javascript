let
  _kuzzle;

class User {
  /**
   *
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    _kuzzle = kuzzle;

    this.id = null;
    this.content = {};
    this.meta = {};
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

