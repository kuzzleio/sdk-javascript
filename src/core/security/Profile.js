class Profile {
  /**
   *
   * @param {Kuzzle} kuzzle
   * @param {Object} data
   */
  constructor (kuzzle, _id = null, content = null) {
    Reflect.defineProperty(this, '_kuzzle', {
      value: kuzzle,
      writable: true
    });

    this._id = _id;
    this.rateLimit = content && content.rateLimit ? content.rateLimit : 0;
    this.policies = content && content.policies ? content.policies : [];
  }

  get kuzzle () {
    return this._kuzzle;
  }

  /**
   * @returns {Promise<[Role]>}
   */
  getRoles (options = {}) {
    if (!this.policies || this.policies.length === 0) {
      return Promise.resolve([]);
    }

    return this.kuzzle.security.mGetRoles(
      this.policies.map(policy => policy.roleId),
      options);
  }
}

module.exports = Profile;

