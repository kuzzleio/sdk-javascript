let _kuzzle;

class Profile {
  /**
   *
   * @param {Kuzzle} kuzzle
   * @param {Object} data
   */
  constructor (kuzzle, _id = null, policies = []) {
    _kuzzle = kuzzle;

    this._id = _id;
    this.policies = policies;
  }

  get kuzzle () {
    return _kuzzle;
  }


  /**
   * @returns {Promise<[Role]>}
   */
  getRoles (options = {}) {
    if (!this.policies || this.policies.length === 0) {
      return Promise.resolve([]);
    }
    return this.kuzzle.security.mGetRoles(this.policies.map(policy => policy.roleId), options);
  }
}

module.exports = Profile;

