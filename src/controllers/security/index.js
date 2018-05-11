const
  Role = require('./role'),
  RoleSearchResult = require('../searchResult/role'),
  Profile = require('./profile'),
  ProfileSearchResult = require('../searchResult/profile'),
  User = require('./user'),
  UserSearchResult = require('../searchResult/user'),
  _kuzzle = Symbol();


class SecurityController {
  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    this[_kuzzle] = kuzzle;
  }

  get kuzzle () {
    return this[_kuzzle];
  }

  createCredentials (strategy, _id, body, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.createCredentials: _id is required');
    }
    if (!strategy) {
      throw new Error('Kuzzle.security.createCredentials: strategy is required');
    }
    if (!body) {
      throw new Error('Kuzzle.security.createCredentials: body is required');
    }

    return this.kuzzle.query({
      _id,
      strategy,
      body,
      controller: 'security',
      action: 'createCredentials'
    }, options);
  }

  createFirstAdmin (_id, body, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.createFirstAdmin: _id is required');
    }
    if (!body) {
      throw new Error('Kuzzle.security.createFirstAdmin: body is required');
    }

    const request = {
      _id,
      body,
      controller: 'security',
      action: 'createFirstAdmin',
      reset: options.reset
    };
    delete options.reset;

    return this.kuzzle.query(request, options)
      .then(result => new User(this.kuzzle, result._id, result._source, result._meta));
  }

  createOrReplaceProfile (_id, body, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.createOrReplaceProfile: _id is required');
    }
    if (!body) {
      throw new Error('Kuzzle.security.createOrReplaceProfile: body is required');
    }

    const request = {
      _id,
      body,
      controller: 'security',
      action: 'createOrReplaceProfile',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.kuzzle.query(request, options)
      .then(result => new Profile(this.kuzzle, result._id, result._source.policies));
  }

  createOrReplaceRole (_id, body, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.createOrReplaceRole: _id is required');
    }
    if (!body) {
      throw new Error('Kuzzle.security.createOrReplaceRole: body is required');
    }

    const request = {
      _id,
      body,
      controller: 'security',
      action: 'createOrReplaceRole',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.kuzzle.query(request, options)
      .then(result => new Role(this.kuzzle, result._id, result._source.controllers));
  }

  createProfile (_id, body, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.createProfile: _id is required');
    }
    if (!body) {
      throw new Error('Kuzzle.security.createProfile: body is required');
    }

    const request = {
      _id,
      body,
      controller: 'security',
      action: 'createProfile',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.kuzzle.query(request, options)
      .then(result => new Profile(this.kuzzle, result._id, result._source.policies));
  }

  createRole (_id, body, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.createRole: _id is required');
    }
    if (!body) {
      throw new Error('Kuzzle.security.createRole: body is required');
    }

    const request = {
      _id,
      body,
      controller: 'security',
      action: 'createRole',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.kuzzle.query(request, options)
      .then(result => new Role(this.kuzzle, result._id, result._source.controllers));
  }

  createUser (_id, body, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.createUser: _id is required');
    }
    if (!body) {
      throw new Error('Kuzzle.security.createUser: body is required');
    }
    if (!body.content) {
      throw new Error('Kuzzle.security.createUser: body.content is required');
    }
    if (!body.credentials) {
      throw new Error('Kuzzle.security.createUser: body.credentials is required');
    }

    const request = {
      _id,
      body,
      controller: 'security',
      action: 'createUser',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.kuzzle.query(request, options)
      .then(result => new User(this.kuzzle, result._id, result._source, result._meta));
  }

  deleteCredentials (strategy, _id, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.deleteCredentials: _id is required');
    }
    if (!strategy) {
      throw new Error('Kuzzle.security.deleteCredentials: strategy is required');
    }

    return this.kuzzle.query({
      strategy,
      _id,
      controller: 'security',
      action: 'deleteCredentials'
    }, options);
  }

  deleteProfile (_id, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.deleteProfile: _id is required');
    }

    return this.kuzzle.query({
      _id,
      controller: 'security',
      action: 'deleteProfile'
    }, options);
  }

  deleteRole (_id, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.deleteRole: _id is required');
    }

    return this.kuzzle.query({
      _id,
      controller: 'security',
      action: 'deleteRole'
    }, options);
  }

  deleteUser (_id, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.deleteUser: _id is required');
    }

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
    if (!strategy) {
      throw new Error('Kuzzle.security.getCredentialFields: strategy is required');
    }

    return this.kuzzle.query({
      strategy,
      controller: 'security',
      action: 'getCredentialFields'
    }, options);
  }

  getCredentials (strategy, _id, options = {}) {
    if (!strategy) {
      throw new Error('Kuzzle.security.getCredentials: strategy is required');
    }
    if (!_id) {
      throw new Error('Kuzzle.security.getCredentials: _id is required');
    }

    return this.kuzzle.query({
      strategy,
      _id,
      controller: 'security',
      action: 'getCredentials'
    }, options);
  }

  getCredentialsById (strategy, _id, options = {}) {
    if (!strategy) {
      throw new Error('Kuzzle.security.getCredentialsById: strategy is required');
    }
    if (!_id) {
      throw new Error('Kuzzle.security.getCredentialsById: _id is required');
    }

    return this.kuzzle.query({
      strategy,
      _id,
      controller: 'security',
      action: 'getCredentialsById'
    }, options);
  }

  getProfile (_id, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.getProfile: _id is required');
    }

    return this.kuzzle.query({
      _id,
      controller: 'security',
      action: 'getProfile'
    }, options)
      .then(result => new Profile(this.kuzzle, result._id, result._source.policies));
  }

  getProfileMapping (options = {}) {
    return this.kuzzle.query({
      controller: 'security',
      action: 'getProfileMapping'
    }, options);
  }

  getProfileRights (_id, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.getProfileRights: _id is required');
    }

    return this.kuzzle.query({
      _id,
      controller: 'security',
      action: 'getProfileRights'
    }, options)
      .then(result => result.hits);
  }

  getRole (_id, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.getRole: _id is required');
    }

    return this.kuzzle.query({
      _id,
      controller: 'security',
      action: 'getRole'
    }, options)
      .then(result => new Role(this.kuzzle, result._id, result._source.controllers));
  }

  getRoleMapping (options = {}) {
    return this.kuzzle.query({
      controller: 'security',
      action: 'getRoleMapping'
    }, options);
  }

  getUser (_id, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.getUser: _id is required');
    }

    return this.kuzzle.query({
      _id,
      controller: 'security',
      action: 'getUser'
    }, options)
      .then(result => new User(this.kuzzle, result._id, result._source, result._meta));
  }

  getUserMapping (options = {}) {
    return this.kuzzle.query({
      controller: 'security',
      action: 'getUserMapping'
    }, options);
  }

  getUserRights (_id, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.getUserRights: _id is required');
    }

    return this.kuzzle.query({
      _id,
      controller: 'security',
      action: 'getUserRights'
    }, options)
      .then(result => result.hits);
  }

  hasCredentials (strategy, _id, options = {}) {
    if (!strategy) {
      throw new Error('Kuzzle.security.hasCredentials: strategy is required');
    }
    if (!_id) {
      throw new Error('Kuzzle.security.hasCredentials: _id is required');
    }

    return this.kuzzle.query({
      strategy,
      _id,
      controller: 'security',
      action: 'hasCredentials'
    }, options);
  }

  mDeleteProfiles (ids, options = {}) {
    if (!Array.isArray(ids)) {
      throw new Error('Kuzzle.security.mDeleteProfiles: ids must be an array');
    }

    const request = {
      controller: 'security',
      action: 'mDeleteProfiles',
      body: {ids},
      refresh: options.refresh
    };
    delete options.refresh;

    return this.kuzzle.query(request, options);
  }

  mDeleteRoles (ids, options = {}) {
    if (!Array.isArray(ids)) {
      throw new Error('Kuzzle.security.mDeleteRoles: ids must be an array');
    }

    const request = {
      controller: 'security',
      action: 'mDeleteRoles',
      body: {ids},
      refresh: options.refresh
    };
    delete options.refresh;

    return this.kuzzle.query(request, options);
  }

  mDeleteUsers (ids, options = {}) {
    if (!Array.isArray(ids)) {
      throw new Error('Kuzzle.security.mDeleteUsers: ids must be an array');
    }

    const request = {
      controller: 'security',
      action: 'mDeleteUsers',
      body: {ids},
      refresh: options.refresh
    };
    delete options.refresh;

    return this.kuzzle.query(request, options);
  }

  mGetProfiles (ids, options = {}) {
    if (!Array.isArray(ids)) {
      throw new Error('Kuzzle.security.mGetProfiles: ids must be an array');
    }

    return this.kuzzle.query({
      controller: 'security',
      action: 'mGetProfiles',
      body: {ids}
    }, options)
      .then(result => result.hits.map(hit => new Profile(this.kuzzle, hit._id , hit._source.policies)));
  }

  mGetRoles (ids, options = {}) {
    if (!Array.isArray(ids)) {
      throw new Error('Kuzzle.security.mGetRoles: ids must be an array');
    }

    return this.kuzzle.query({
      controller: 'security',
      action: 'mGetRoles',
      body: {ids}
    }, options)
      .then(result => result.hits.map(hit => new Role(this.kuzzle, hit._id, hit._source.controllers)));
  }

  replaceUser (_id, body, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.replaceUser: _id is required');
    }
    if (!body) {
      throw new Error('Kuzzle.security.replaceUser: body is required');
    }

    const request = {
      _id,
      body,
      controller: 'security',
      action: 'replaceUser',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.kuzzle.query(request, options)
      .then(result => new User(this.kuzzle, result._id, result._source, result._meta));
  }

  searchProfiles (body, options= {}) {
    const request = {
      body,
      controller: 'security',
      action: 'searchProfiles'
    };
    for (const opt of ['from', 'size', 'scroll']) {
      request[opt] = options[opt];
      delete options[opt];
    }

    return this.kuzzle.query(request, options)
      .then(result => new ProfileSearchResult(this.kuzzle, request, options, result));
  }

  searchRoles (body, options = {}) {
    const request = {
      body,
      controller: 'security',
      action: 'searchRoles'
    };
    for (const opt of ['from', 'size']) {
      request[opt] = options[opt];
      delete options[opt];
    }

    return this.kuzzle.query(request, options)
      .then(result => new RoleSearchResult(this.kuzzle, request, options, result));
  }

  searchUsers (body, options = {}) {
    const request = {
      body,
      controller: 'security',
      action: 'searchUsers'
    };
    for (const opt of ['from', 'size', 'scroll']) {
      request[opt] = options[opt];
      delete options[opt];
    }

    return this.kuzzle.query(request, options)
      .then(result => new UserSearchResult(this.kuzzle, request, options, result));
  }

  updateCredentials (strategy, _id, body, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.updateCredentials: _id is required');
    }
    if (!strategy) {
      throw new Error('Kuzzle.security.updateCredentials: strategy is required');
    }
    if (!body) {
      throw new Error('Kuzzle.security.updateCredentials: body is required');
    }

    return this.kuzzle.query({
      strategy,
      _id,
      body,
      controller: 'security',
      action: 'updateCredentials'
    }, options);
  }

  updateProfile (_id, body, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.updateProfile: _id is required');
    }
    if (!body) {
      throw new Error('Kuzzle.security.updateProfile: body is required');
    }

    const request = {
      _id,
      body,
      controller: 'security',
      action: 'updateProfile',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.kuzzle.query(request, options)
      .then(result => new Profile(this.kuzzle, result._id, result._source.policies));
  }

  updateProfileMapping (body, options = {}) {
    return this.kuzzle.query({
      body,
      controller: 'security',
      action: 'updateProfileMapping'
    }, options);
  }

  updateRole (_id, body, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.updateRole: _id is required');
    }
    if (!body) {
      throw new Error('Kuzzle.security.updateRole: body is required');
    }

    const request = {
      _id,
      body,
      controller: 'security',
      action: 'updateRole',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.kuzzle.query(request, options)
      .then(result => new Role(this.kuzzle, result._id, result._source.controllers));
  }

  updateRoleMapping (body, options = {}) {
    return this.kuzzle.query({
      body,
      controller: 'security',
      action: 'updateRoleMapping'
    }, options);
  }

  updateUser (_id, body, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.updateUser: _id is required');
    }
    if (!body) {
      throw new Error('Kuzzle.security.updateUser: body is required');
    }

    const request = {
      _id,
      body,
      controller: 'security',
      action: 'updateUser',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.kuzzle.query(request, options)
      .then(result => new User(this.kuzzle, result._id, result._source, result._meta));
  }

  updateUserMapping (body, options = {}) {
    return this.kuzzle.query({
      body,
      controller: 'security',
      action: 'updateUserMapping'
    }, options);
  }

  validateCredentials (strategy, _id, body, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.validateCredentials: _id is required');
    }
    if (!strategy) {
      throw new Error('Kuzzle.security.validateCredentials: strategy is required');
    }
    if (!body) {
      throw new Error('Kuzzle.security.validateCredentials: body is required');
    }

    return this.kuzzle.query({
      _id,
      strategy,
      body,
      controller: 'security',
      action: 'validateCredentials'
    }, options);
  }
}

module.exports = SecurityController;
