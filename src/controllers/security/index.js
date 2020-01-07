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
    return this.query({
      _id,
      strategy,
      body,
      action: 'createCredentials'
    }, options)
      .then(response => response.result);
  }

  createFirstAdmin (_id, body, options = {}) {
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
    const request = {
      _id,
      body,
      action: 'createOrReplaceProfile'
    };

    return this.query(request, options)
      .then(response => new Profile(this.kuzzle, response.result._id, response.result._source.policies));
  }

  createOrReplaceRole (_id, body, options = {}) {
    const request = {
      _id,
      body,
      action: 'createOrReplaceRole',
      force: options.force ? true : null
    };
    return this.query(request, options)
      .then(response => new Role(this.kuzzle, response.result._id, response.result._source.controllers));
  }

  createProfile (_id, body, options = {}) {
    const request = {
      _id,
      body,
      action: 'createProfile'
    };

    return this.query(request, options)
      .then(response => new Profile(this.kuzzle, response.result._id, response.result._source.policies));
  }

  createRestrictedUser (body, _id = null, options = {}) {
    if (!body.content) {
      body.content = {};
    }

    const request = {
      _id,
      body,
      action: 'createRestrictedUser'
    };

    return this.query(request, options)
      .then(response => new User(this.kuzzle, response.result._id, response.result._source));
  }

  createRole (_id, body, options = {}) {
    const request = {
      _id,
      body,
      action: 'createRole',
      force: options.force ? true : null
    };
    return this.query(request, options)
      .then(response => new Role(this.kuzzle, response.result._id, response.result._source.controllers));
  }

  createUser (_id, body, options = {}) {
    const request = {
      _id,
      body,
      action: 'createUser'
    };

    return this.query(request, options)
      .then(response => new User(this.kuzzle, response.result._id, response.result._source));
  }

  deleteCredentials (strategy, _id, options = {}) {
    const request = {
      strategy,
      _id,
      action: 'deleteCredentials'
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  deleteProfile (_id, options = {}) {
    const request = {
      _id,
      action: 'deleteProfile'
    };
    return this.query(request, options)
      .then(response => response.result);
  }

  deleteRole (_id, options = {}) {
    const request = {
      _id,
      action: 'deleteRole'
    };
    return this.query(request, options)
      .then(response => response.result);
  }

  deleteUser (_id, options = {}) {
    const request = {
      _id,
      action: 'deleteUser'
    };
    return this.query(request, options)
      .then(response => response.result);
  }

  getAllCredentialFields (options = {}) {
    return this.query({
      action: 'getAllCredentialFields'
    }, options)
      .then(response => response.result);
  }

  getCredentialFields (strategy, options = {}) {
    return this.query({
      strategy,
      action: 'getCredentialFields'
    }, options)
      .then(response => response.result);
  }

  getCredentials (strategy, _id, options = {}) {
    return this.query({
      strategy,
      _id,
      action: 'getCredentials'
    }, options)
      .then(response => response.result);
  }

  getCredentialsById (strategy, _id, options = {}) {
    return this.query({
      strategy,
      _id,
      action: 'getCredentialsById'
    }, options)
      .then(response => response.result);
  }

  getProfile (_id, options = {}) {
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
    return this.query({
      _id,
      action: 'getProfileRights'
    }, options)
      .then(response => response.result.hits);
  }

  getRole (_id, options = {}) {
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
    return this.query({
      _id,
      action: 'getUserRights'
    }, options)
      .then(response => response.result.hits);
  }

  hasCredentials (strategy, _id, options = {}) {
    return this.query({
      strategy,
      _id,
      action: 'hasCredentials'
    }, options)
      .then(response => response.result);
  }

  mDeleteProfiles (ids, options = {}) {
    const request = {
      action: 'mDeleteProfiles',
      body: {ids}
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  mDeleteRoles (ids, options = {}) {
    const request = {
      action: 'mDeleteRoles',
      body: {ids}
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  mDeleteUsers (ids, options = {}) {
    const request = {
      action: 'mDeleteUsers',
      body: {ids}
    };

    return this.query(request, options)
      .then(response => response.result);
  }

  mGetProfiles (ids, options = {}) {
    return this.query({
      action: 'mGetProfiles',
      body: {ids}
    }, options)
      .then(response => response.result.hits.map(hit => new Profile(this.kuzzle, hit._id , hit._source.policies)));
  }

  mGetRoles (ids, options = {}) {
    return this.query({
      action: 'mGetRoles',
      body: {ids}
    }, options)
      .then(response => response.result.hits.map(hit => new Role(this.kuzzle, hit._id, hit._source.controllers)));
  }

  replaceUser (_id, body, options = {}) {
    const request = {
      _id,
      body,
      action: 'replaceUser'
    };
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
    return this.query({
      strategy,
      _id,
      body,
      action: 'updateCredentials'
    }, options)
      .then(response => response.result);
  }

  updateProfile (_id, body, options = {}) {
    const request = {
      _id,
      body,
      action: 'updateProfile'
    };
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
    const request = {
      _id,
      body,
      action: 'updateRole',
      force: options.force ? true : null
    };

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
    const request = {
      _id,
      body,
      action: 'updateUser'
    };
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
