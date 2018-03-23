const
  Role = require('./role'),
  RoleSearchResult = require('../searchResult/role'),
  Profile = require('./profile'),
  ProfileSearchResult = require('../searchResult/profile'),
  User = require('./user'),
  UserSearchResult = require('../searchResult/user');

let
  _kuzzle;


class SecurityController {
  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    _kuzzle = kuzzle;
  }

  get kuzzle () {
    return _kuzzle;
  }

  createCredentials (_id, body, options = {}) {
    return this.kuzzle.query({
      _id,
      body,
      controller: 'security',
      action: 'createCredentials'
    }, options);
  }

  createFirstAdmin (_id, body, options = {}) {
    return this.kuzzle.query({
      _id,
      body,
      controller: 'security',
      action: 'createFirstAdmin'
    }, options);
  }

  createOrReplaceProfile (_id, body, options = {}) {
    return this.kuzzle.query({
      _id,
      body,
      controller: 'security',
      action: 'createOrReplaceProfile'
    }, options);
  }

  createOrReplaceRole (_id, body, options = {}) {
    return this.kuzzle.query({
      _id,
      body,
      controller: 'security',
      action: 'createOrReplaceRole'
    }, options);
  }

  createProfile (_id, body, options = {}) {
    return this.kuzzle.query({
      _id,
      body,
      controller: 'security',
      action: 'createProfile'
    }, options);
  }

  createRole (_id, body, options = {}) {
    return this.kuzzle.query({
      _id,
      body,
      controller: 'security',
      action: 'createRole'
    }, options);
  }

  createUser (_id, body, options = {}) {
    return this.kuzzle.query({
      _id,
      body,
      controller: 'security',
      action: 'createUser'
    }, options);
  }

  deleteCredentials (strategy, _id, options = {}) {
    return this.kuzzle.query({
      strategy,
      _id,
      controller: 'security',
      action: 'deleteCredentials'
    }, options);
  }

  deleteProfile (_id, options = {}) {
    return this.kuzzle.query({
      _id,
      controller: 'security',
      action: 'deleteProfile'
    }, options);
  }

  deleteUser (_id, options = {}) {
    return this.kuzzle.query({
      _id,
      controller: 'security',
      action: 'deleteUser'
    }, options);
  }

  getAllCredentialFields (options = {}) {
    return this.kuzzle.query({
      controller: 'security',
      action: 'getAllCredentialFields'
    }, options);
  }

  getCredentialFields (strategy, options = {}) {
    return this.kuzzle.query({
      strategy,
      controller: 'security',
      action: 'getCredentialFields'
    }, options);
  }

  getCredentials (strategy, _id, options = {}) {
    return this.kuzzle.query({
      strategy,
      _id,
      controller: 'security',
      action: 'getCredentials'
    }, options);
  }

  getCredentialsById (strategy, _id, options = {}) {
    return this.kuzzle.query({
      strategy,
      _id,
      controller: 'security',
      action: 'getCrednetialsById'
    }, options);
  }

  getProfile (_id, options = {}) {
    return this.kuzzle.query({
      _id,
      controller: 'security',
      action: 'getProfile'
    }, options)
      .then(result => {
        const profile = new Profile(this.kuzzle);

        profile._id = result._id;
        profile.policies = result._source.policies;

        return profile;
      });
  }

  getProfileMapping (options = {}) {
    return this.kuzzle.query({
      controller: 'security',
      action: 'getProfileMapping'
    }, options);
  }

  getProfileRights (_id, options = {}) {
    return this.kuzzle.query({
      _id,
      controller: 'security',
      action: 'getProfileRights'
    }, options);
  }

  getRole (_id, options = {}) {
    return this.kuzzle.query({
      _id,
      controller: 'security',
      action: 'getRole'
    }, options)
      .then(result => {
        const role = new Role(this.kuzzle);

        role._id = result._id;
        role.controllers = result._source.controllers;

        return role;
      });
  }

  getRoleMapping (options = {}) {
    return this.kuzzle.query({
      controller: 'security',
      action: 'getRoleMapping'
    }, options);
  }

  getUser (_id, options = {}) {
    return this.kuzzle.query({
      _id,
      controller: 'security',
      action: 'getUser'
    }, options)
      .then(result => {
        const user = new User(this.kuzzle);

        user._id = result._id;
        user.content = result._source;
        user.meta = result._meta;

        return user;
      });
  }

  getUserMapping (options = {}) {
    return this.kuzzle.query({
      controller: 'security',
      action: 'getUserMapping'
    }, options);
  }

  getUserRights (_id, options = {}) {
    return this.kuzzle.query({
      _id,
      controller: 'security',
      action: 'getuserRights'
    }, options)
      .then(result => result.hits);
  }

  hasCredentials (strategy, _id, options = {}) {
    return this.kuzzle.query({
      strategy,
      _id,
      controller: 'security',
      action: 'hasCredentials'
    }, options);
  }

  mDeleteProfiles (ids, options = {}) {
    return this.kuzzle.query({
      controller: 'security',
      action: 'mDeleteProfiles',
      body: {ids}
    }, options);
  }

  mDeleteRoles (ids, options = {}) {
    return this.kuzzle.query({
      controller: 'security',
      action: 'mDeleteRoles',
      body: {ids}
    }, options);
  }

  mDeleteUsers (ids, options = {}) {
    return this.kuzzle.query({
      controller: 'security',
      action: 'mDeleteUsers',
      body: {ids}
    }, options);
  }

  mGetProfiles (ids, options = {}) {
    return this.kuzzle.query({
      controller: 'security',
      action: 'mGetProfiles',
      body: {ids}
    }, options)
      .then(result => result.hits.map(hit => {
        const profile = new Profile(this.kuzzle);

        profile._id = hit._id;
        profile.policies = hit._source.policies;

        return profile;
      }));
  }

  mGetRoles (ids, options = {}) {
    return this.kuzzle.query({
      controller: 'security',
      action: 'mGetRoles',
      body: {ids}
    }, options)
      .then(result => result.hits.map(hit => {
        const role = new Role(this.kuzzle);

        role._id = hit._id;
        role.controllers = hit._source.controllers;

        return role;
      }));
  }

  replaceUser (_id, body, options = {}) {
    return this.kuzzle.query({
      _id,
      body,
      controller: 'security',
      action: 'replaceUser'
    }, options)
      .then(result => {
        const user = new User(this.kuzzle);

        user._id = result._id;
        user.content = result._source;
        user.meta = result._meta;

        return user;
      });
  }

  searchProfiles (body, options= {}) {
    const request = {
      body,
      controller: 'security',
      action: 'searchProfiles'
    };

    return this.kuzzle.query(request, options)
      .then(result => new ProfileSearchResult(this.kuzzle, request, options, result));
  }

  searchRoles (body, options = {}) {
    const request = {
      body,
      controller: 'security',
      action: 'searchRoles'
    };

    return this.kuzzle.query(request, options)
      .then(result => new RoleSearchResult(this.kuzzle, request, options, result));
  }

  searchUsers (body, options = {}) {
    const request = {
      body,
      controller: 'security',
      action: 'searchUsers'
    };

    return this.kuzzle.query(request, options)
      .then(result => new UserSearchResult(this.kuzzle, request, options, result));
  }

  updateCredentials (strategy, _id, body, options = {}) {
    return this.kuzzle.query({
      strategy,
      _id,
      body,
      controller: 'security',
      action: 'updateCredentials'
    }, options);
  }

  updateProfile (_id, body, options = {}) {
    return this.kuzzle.query({
      _id,
      body,
      controller: 'security',
      action: 'updateProfile'
    }, options);
  }

  updateProfileMapping (body, options = {}) {
    return this.kuzzle.query({
      body,
      controller: 'security',
      action: 'updateProfileMapping'
    }, options);
  }

  updateRole (_id, body, options = {}) {
    return this.kuzzle.query({
      _id,
      body,
      controller: 'security',
      action: 'updateRole'
    }, options);
  }

  updateRoleMapping (body, options = {}) {
    return this.kuzzle.query({
      body,
      controller: 'security',
      action: 'updateRoleMapping'
    }, options);
  }

  updateUser (_id, body, options = {}) {
    return this.kuzzle.query({
      _id,
      body,
      controller: 'security',
      action: 'updateUser'
    }, options);
  }

  updateUserMapping (body, options = {}) {
    return this.kuzzle.query({
      body,
      controller: 'security',
      action: 'updateUserMapping'
    }, options);
  }

  validateCredentials (body, options = {}) {
    return this.kuzzle.query({
      body,
      controller: 'security',
      action: 'validateCredentials'
    }, options);
  }
}

module.exports = SecurityController;
