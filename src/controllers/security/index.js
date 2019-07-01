const
  BaseController = require('../base'),
  Role = require('./role'),
  RoleSearchResult = require('../searchResult/role'),
  Profile = require('./profile'),
  ProfileSearchResult = require('../searchResult/profile'),
  User = require('./user'),
  UserSearchResult = require('../searchResult/user');

class SecurityController extends BaseController {
  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    super(kuzzle, 'security');
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

    return this.query({
      _id,
      strategy,
      body,
      action: 'createCredentials'
    }, options)
      .then(response => response.result);
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
      action: 'createFirstAdmin',
      reset: options.reset
    };
    delete options.reset;

    return this.query(request, options)
      .then(response => new User(this.kuzzle, response.result._id, response.result._source));
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
      action: 'createOrReplaceProfile',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => new Profile(this.kuzzle, response.result._id, response.result._source.policies));
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
      action: 'createOrReplaceRole',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => new Role(this.kuzzle, response.result._id, response.result._source.controllers));
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
      action: 'createProfile',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => new Profile(this.kuzzle, response.result._id, response.result._source.policies));
  }

  createRestrictedUser (body, _id = null, options = {}) {
    if (!body.credentials) {
      throw new Error('Kuzzle.security.createRestrictedUser: body.credentials is required');
    }
    if (!body.content) {
      body.content = {};
    }

    const request = {
      _id,
      body,
      action: 'createRestrictedUser',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => new User(this.kuzzle, response.result._id, response.result._source));
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
      action: 'createRole',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => new Role(this.kuzzle, response.result._id, response.result._source.controllers));
  }

  createUser (_id, body, options = {}) {
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
      action: 'createUser',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => new User(this.kuzzle, response.result._id, response.result._source));
  }

  deleteCredentials (strategy, _id, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.deleteCredentials: _id is required');
    }
    if (!strategy) {
      throw new Error('Kuzzle.security.deleteCredentials: strategy is required');
    }

    return this.query({
      strategy,
      _id,
      action: 'deleteCredentials'
    }, options)
      .then(response => response.result);
  }

  deleteProfile (_id, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.deleteProfile: _id is required');
    }

    return this.query({
      _id,
      action: 'deleteProfile'
    }, options)
      .then(response => response.result);
  }

  deleteRole (_id, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.deleteRole: _id is required');
    }

    return this.query({
      _id,
      action: 'deleteRole'
    }, options)
      .then(response => response.result);
  }

  deleteUser (_id, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.deleteUser: _id is required');
    }

    return this.query({
      _id,
      action: 'deleteUser'
    }, options)
      .then(response => response.result);
  }

  getAllCredentialFields (options = {}) {
    return this.query({
      action: 'getAllCredentialFields'
    }, options)
      .then(response => response.result);
  }

  getCredentialFields (strategy, options = {}) {
    if (!strategy) {
      throw new Error('Kuzzle.security.getCredentialFields: strategy is required');
    }

    return this.query({
      strategy,
      action: 'getCredentialFields'
    }, options)
      .then(response => response.result);
  }

  getCredentials (strategy, _id, options = {}) {
    if (!strategy) {
      throw new Error('Kuzzle.security.getCredentials: strategy is required');
    }
    if (!_id) {
      throw new Error('Kuzzle.security.getCredentials: _id is required');
    }

    return this.query({
      strategy,
      _id,
      action: 'getCredentials'
    }, options)
      .then(response => response.result);
  }

  getCredentialsById (strategy, _id, options = {}) {
    if (!strategy) {
      throw new Error('Kuzzle.security.getCredentialsById: strategy is required');
    }
    if (!_id) {
      throw new Error('Kuzzle.security.getCredentialsById: _id is required');
    }

    return this.query({
      strategy,
      _id,
      action: 'getCredentialsById'
    }, options)
      .then(response => response.result);
  }

  getProfile (_id, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.getProfile: _id is required');
    }

    return this.query({
      _id,
      action: 'getProfile'
    }, options)
      .then(response => new Profile(this.kuzzle, response.result._id, response.result._source.policies));
  }

  getProfileMapping (options = {}) {
    return this.query({
      action: 'getProfileMapping'
    }, options)
      .then(response => response.result);
  }

  getProfileRights (_id, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.getProfileRights: _id is required');
    }

    return this.query({
      _id,
      action: 'getProfileRights'
    }, options)
      .then(response => response.result.hits);
  }

  getRole (_id, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.getRole: _id is required');
    }

    return this.query({
      _id,
      action: 'getRole'
    }, options)
      .then(response => new Role(this.kuzzle, response.result._id, response.result._source.controllers));
  }

  getRoleMapping (options = {}) {
    return this.query({
      action: 'getRoleMapping'
    }, options)
      .then(response => response.result);
  }

  getUser (_id, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.getUser: _id is required');
    }

    return this.query({
      _id,
      action: 'getUser'
    }, options)
      .then(response => new User(this.kuzzle, response.result._id, response.result._source));
  }

  getUserMapping (options = {}) {
    return this.query({
      action: 'getUserMapping'
    }, options)
      .then(response => response.result);
  }

  getUserRights (_id, options = {}) {
    if (!_id) {
      throw new Error('Kuzzle.security.getUserRights: _id is required');
    }

    return this.query({
      _id,
      action: 'getUserRights'
    }, options)
      .then(response => response.result.hits);
  }

  hasCredentials (strategy, _id, options = {}) {
    if (!strategy) {
      throw new Error('Kuzzle.security.hasCredentials: strategy is required');
    }
    if (!_id) {
      throw new Error('Kuzzle.security.hasCredentials: _id is required');
    }

    return this.query({
      strategy,
      _id,
      action: 'hasCredentials'
    }, options)
      .then(response => response.result);
  }

  mDeleteProfiles (ids, options = {}) {
    if (!Array.isArray(ids)) {
      throw new Error('Kuzzle.security.mDeleteProfiles: ids must be an array');
    }

    const request = {
      action: 'mDeleteProfiles',
      body: {ids},
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => response.result);
  }

  mDeleteRoles (ids, options = {}) {
    if (!Array.isArray(ids)) {
      throw new Error('Kuzzle.security.mDeleteRoles: ids must be an array');
    }

    const request = {
      action: 'mDeleteRoles',
      body: {ids},
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => response.result);
  }

  mDeleteUsers (ids, options = {}) {
    if (!Array.isArray(ids)) {
      throw new Error('Kuzzle.security.mDeleteUsers: ids must be an array');
    }

    const request = {
      action: 'mDeleteUsers',
      body: {ids},
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => response.result);
  }

  mGetProfiles (ids, options = {}) {
    if (!Array.isArray(ids)) {
      throw new Error('Kuzzle.security.mGetProfiles: ids must be an array');
    }

    return this.query({
      action: 'mGetProfiles',
      body: {ids}
    }, options)
      .then(response => response.result.hits.map(hit => new Profile(this.kuzzle, hit._id , hit._source.policies)));
  }

  mGetRoles (ids, options = {}) {
    if (!Array.isArray(ids)) {
      throw new Error('Kuzzle.security.mGetRoles: ids must be an array');
    }

    return this.query({
      action: 'mGetRoles',
      body: {ids}
    }, options)
      .then(response => response.result.hits.map(hit => new Role(this.kuzzle, hit._id, hit._source.controllers)));
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
      action: 'replaceUser',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => new User(this.kuzzle, response.result._id, response.result._source));
  }

  searchProfiles (body, options= {}) {
    const request = {
      body,
      action: 'searchProfiles'
    };
    for (const opt of ['from', 'size', 'scroll']) {
      request[opt] = options[opt];
      delete options[opt];
    }

    return this.query(request, options)
      .then(response => new ProfileSearchResult(this.kuzzle, request, options, response.result));
  }

  searchRoles (body, options = {}) {
    const request = {
      body,
      action: 'searchRoles'
    };
    for (const opt of ['from', 'size']) {
      request[opt] = options[opt];
      delete options[opt];
    }

    return this.query(request, options)
      .then(response => new RoleSearchResult(this.kuzzle, request, options, response.result));
  }

  searchUsers (body, options = {}) {
    const request = {
      body,
      action: 'searchUsers'
    };
    for (const opt of ['from', 'size', 'scroll']) {
      request[opt] = options[opt];
      delete options[opt];
    }

    return this.query(request, options)
      .then(response => new UserSearchResult(this.kuzzle, request, options, response.result));
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

    return this.query({
      strategy,
      _id,
      body,
      action: 'updateCredentials'
    }, options)
      .then(response => response.result);
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
      action: 'updateProfile',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => new Profile(this.kuzzle, response.result._id, response.result._source.policies));
  }

  updateProfileMapping (body, options = {}) {
    return this.query({
      body,
      action: 'updateProfileMapping'
    }, options)
      .then(response => response.result);
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
      action: 'updateRole',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => new Role(this.kuzzle, response.result._id, response.result._source.controllers));
  }

  updateRoleMapping (body, options = {}) {
    return this.query({
      body,
      action: 'updateRoleMapping'
    }, options)
      .then(response => response.result);
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
      action: 'updateUser',
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => new User(this.kuzzle, response.result._id, response.result._source));
  }

  updateUserMapping (body, options = {}) {
    return this.query({
      body,
      action: 'updateUserMapping'
    }, options)
      .then(response => response.result);
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

    return this.query({
      _id,
      strategy,
      body,
      action: 'validateCredentials'
    }, options)
      .then(response => response.result);
  }
}

module.exports = SecurityController;
