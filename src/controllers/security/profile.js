let _kuzzle;

class Profile {
  constructor (kuzzle) {
    _kuzzle = kuzzle;

    this._id = null;
    this.policies = [];
  }

  get kuzzle () {
    return _kuzzle;
  }

  getRoles (options = {}) {
    if (!this.policies || this.policies.length === 0) {
      return Promise.resolve([]);
    }
    return this.kuzzle.security.mGetRoles(this.policies.map(policy => policy.roleId), options);
  }
}

module.exports = Profile;

