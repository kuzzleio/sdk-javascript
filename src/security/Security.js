var
  Role = require('./Role'),
  Profile = require('./Profile'),
  User = require('./User');

/**
 * Kuzzle security constructor
 *
 * @param kuzzle
 * @returns {Security}
 * @constructor
 */
function Security(kuzzle) {

  Object.defineProperty(this, 'kuzzle', {
    value: kuzzle
  });

  Object.defineProperty(this, 'buildQueryArgs', {
    value: function (action) {
      return {
        controller: 'security',
        action: action
      };
    }
  });

  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var blacklist = ['role', 'profile', 'user', 'isActionAllowed'];

        return passes && blacklist.indexOf(name) === -1;
      }
    });
  }

  return this;
}


/**
 * Retrieve a single Role using its unique role ID.
 *
 * @param {string} id
 * @param {object|responseCallback} [options] - Optional parameters
 * @param {responseCallback} [cb] - returns Kuzzle's response
 */
Security.prototype.fetchRole = function (id, options, cb) {
  var
    data,
    self = this;

  if (!id) {
    throw new Error('Id parameter is mandatory for fetchRole function');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data = {_id: id};

  self.kuzzle.callbackRequired('Security.fetchRole', cb);

  self.kuzzle.query(this.buildQueryArgs('getRole'), data, options, function (err, response) {
    cb(err, err ? undefined : new Role(self, response.result._id, response.result._source, response.result._meta));
  });
};

/**
 * Executes a search on roles according to a filter
 *
 * /!\ There is a small delay between role creation and their existence in our persistent search layer,
 * usually a couple of seconds.
 * That means that a role that was just been created won’t be returned by this function.
 *
 * @param {Object} filters - this object can contains an array `indexes` with a list of index id, a integer `from` and a integer `size`
 * @param {object|responseCallback} [options] - Optional parameters
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 */
Security.prototype.searchRoles = function (filters, options, cb) {
  var
    self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.callbackRequired('Security.searchRoles', cb);

  self.kuzzle.query(this.buildQueryArgs('searchRoles'), {body: filters}, options, function (error, result) {
    var documents;

    if (error) {
      return cb(error);
    }

    documents = result.result.hits.map(function (doc) {
      return new Role(self, doc._id, doc._source, doc._meta);
    });

    cb(null, { total: result.result.total, roles: documents });
  });
};

/**
 * Create a new role in Kuzzle.
 *
 * Takes an optional argument object with the following property:
 *    - replaceIfExist (boolean, default: false):
 *        If the same role already exists: throw an error if sets to false.
 *        Replace the existing role otherwise
 *
 * @param {string} id - role identifier
 * @param {object} content - a plain javascript object representing the role
 * @param {object|responseCallback} [options] - (optional) arguments
 * @param {responseCallback} [cb] - (optional) Handles the query response
 */
Security.prototype.createRole = function (id, content, options, cb) {
  var
    self = this,
    data = {},
    action = 'createRole';

  if (!id || typeof id !== 'string') {
    throw new Error('Security.createRole: cannot create a role without a role ID');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data._id = id;
  data.body = content;

  if (options) {
    action = options.replaceIfExist ? 'createOrReplaceRole' : 'createRole';
  }

  self.kuzzle.query(this.buildQueryArgs(action), data, options, cb && function (err, res) {
    cb(err, err ? undefined : new Role(self, res.result._id, res.result._source, res.result._meta));
  });
};


/**
 * Update a role in Kuzzle.
 *
 * @param {string} id - role identifier
 * @param {object} content - a plain javascript object representing the role's modification
 * @param {object|responseCallback} [options] - (optional) arguments
 * @param {responseCallback} [cb] - (optional) Handles the query response
 * @returns {Security} this object
 */
Security.prototype.updateRole = function (id, content, options, cb) {
  var
    self = this,
    data = {_id: id, body: content},
    action = 'updateRole';

  if (!id || typeof id !== 'string') {
    throw new Error('Security.updateRole: cannot update a role without a role ID');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(this.buildQueryArgs(action), data, options, cb && function (err, res) {
    cb(err, err ? undefined : new Role(self, id, content, res.result._meta));
  });

  return this;
};

/**
 * Delete role.
 *
 * There is a small delay between role deletion and their deletion in our advanced search layer,
 * usually a couple of seconds.
 * That means that a role that was just been delete will be returned by this function
 *
 *
 * @param {string} id - Role id to delete
 * @param {object|responseCallback} [options] - (optional) arguments
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {Security} this object
 */
Security.prototype.deleteRole = function (id, options, cb) {
  var data = {_id: id};

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.query(this.buildQueryArgs('deleteRole'), data, options, cb && function (err, res) {
    cb(err, err ? undefined : res.result._id);
  });

  return this;
};

/**
 * Instantiate a new Role object. Workaround to the module.exports limitation, preventing multiple
 * constructors to be exposed without having to use a factory or a composed object.
 *
 * @param {string} id - role id
 * @param {object} content - role content
 * @param {object} meta - role metadata
 * @constructor
 */
Security.prototype.role = function(id, content, meta) {
  return new Role(this, id, content, meta);
};


/**
 * Get a specific profile from kuzzle
 *
 *
 * @param {string} id
 * @param {object|responseCallback} [options] - (optional) arguments
 * @param {responseCallback} cb - returns Kuzzle's response
 */
Security.prototype.fetchProfile = function (id, options, cb) {
  var
    data,
    self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (!id || typeof id !== 'string') {
    throw new Error('Id parameter is mandatory for fetchProfile function');
  }


  data = {_id: id};

  self.kuzzle.callbackRequired('Security.fetchProfile', cb);

  self.kuzzle.query(this.buildQueryArgs('getProfile'), data, options, function (error, response) {
    cb(error, error ? undefined : new Profile(self, response.result._id, response.result._source, response.result._meta));
  });
};

/**
 * Executes a search on profiles according to a filter
 *
 *
 * /!\ There is a small delay between profile creation and their existence in our persistent search layer,
 * usually a couple of seconds.
 * That means that a profile that was just been created won’t be returned by this function.
 *
 * @param {Object} filters - this object can contains an array `roles` with a list of roles id, a integer `from` and a integer `size`
 * @param {object|responseCallback} [options] - (optional) arguments
 * @param {responseCallback} [cb] - returns Kuzzle's response
 */
Security.prototype.searchProfiles = function (filters, options, cb) {
  var
    self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.callbackRequired('Security.searchProfiles', cb);

  self.kuzzle.query(this.buildQueryArgs('searchProfiles'), {body: filters}, options, function (error, response) {
    var
      documents,
      scrollId;

    if (error) {
      return cb(error);
    }

    documents = response.result.hits.map(function (doc) {
      return new Profile(self, doc._id, doc._source, doc._meta);
    });

    if (response.result.scrollId) {
      scrollId = response.result.scrollId;
    }

    cb(null, { total: response.result.total, profiles: documents, scrollId: scrollId });
  });
};

/**
 * Create a new profile in Kuzzle.
 *
 * Takes an optional argument object with the following property:
 *    - replaceIfExist (boolean, default: false):
 *        If the same profile already exists: throw an error if sets to false.
 *        Replace the existing profile otherwise
 *
 * @param {string} id - profile identifier
 * @param {array} policies - list of policies to attach to the new profile
 * @param {object|responseCallback} [options] - (optional) arguments
 * @param {responseCallback} [cb] - (optional) Handles the query response
 */
Security.prototype.createProfile = function (id, policies, options, cb) {
  var
    self = this,
    data = {},
    action = 'createProfile';

  if (!id || typeof id !== 'string') {
    throw new Error('Security.createProfile: cannot create a profile without a profile ID');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data._id = id;

  if (policies) {
    data.body = { policies: policies };
  }

  if (options) {
    action = options.replaceIfExist ? 'createOrReplaceProfile' : 'createProfile';
  }

  self.kuzzle.query(this.buildQueryArgs(action), data, options, cb && function (err, res) {
    cb(err, err ? undefined : new Profile(self, res.result._id, res.result._source, res.result._meta));
  });
};


/**
 * Update a profile in Kuzzle.
 *
 * @param {string} id - profile identifier
 * @param {array} policies - the list of policies to apply to this profile
 * @param {object|responseCallback} [options] - (optional) arguments
 * @param {responseCallback} [cb] - (optional) Handles the query response
 * @returns {Security} this object
 */
Security.prototype.updateProfile = function (id, policies, options, cb) {
  var
    self = this,
    data = {},
    action = 'updateProfile';

  if (!id || typeof id !== 'string') {
    throw new Error('Security.updateProfile: cannot update a profile without a profile ID');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data._id = id;

  if (policies) {
    data.body = {policies: policies};
  }

  self.kuzzle.query(this.buildQueryArgs(action), data, options, cb && function (err, res) {
    var updatedContent = {};

    if (err) {
      return cb(err);
    }

    Object.keys(res.result._source).forEach(function (property) {
      updatedContent[property] = res.result._source[property];
    });

    cb(null, new Profile(self, res.result._id, updatedContent, res.result._meta));
  });

  return this;
};

/**
 * Delete profile.
 *
 * There is a small delay between profile deletion and their deletion in our advanced search layer,
 * usually a couple of seconds.
 * That means that a profile that was just been delete will be returned by this function
 *
 *
 * @param {string} id - Profile id to delete
 * @param {object|responseCallback} [options] - (optional) arguments
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {Security} this object
 */
Security.prototype.deleteProfile = function (id, options, cb) {
  var data = {_id: id};

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.query(this.buildQueryArgs('deleteProfile'), data, options, cb && function (err, res) {
    cb(err, err ? undefined : res.result._id);
  });

  return this;
};

/**
 * @param {string} scrollId
 * @param {object} [options]
 * @param {responseCallback} cb
 */
Security.prototype.scrollProfiles = function (scrollId, options, cb) {
  var
    request = {},
    self = this;

  if (!scrollId) {
    throw new Error('Security.scrollProfiles: scrollId is required');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = {};
  }

  this.kuzzle.callbackRequired('Security.scrollProfiles', cb);

  request.scrollId = scrollId;

  if (options && options.scroll) {
    request.scroll = options.scroll;
  }

  this.kuzzle.query({controller: 'security', action: 'scrollProfiles'}, request, options, function (error, result) {
    var profiles = [];

    if (error) {
      return cb(error);
    }

    result.result.hits.forEach(function (profile) {
      var newProfile = new Profile(self, profile._id, profile._source, profile._meta);

      newProfile.version = profile._version;

      profiles.push(newProfile);
    });

    cb(null, {
      total: result.result.total,
      profiles: profiles,
      scrollId: scrollId
    });
  });
};

/**
 * Instantiate a new Profile object. Workaround to the module.exports limitation, preventing multiple
 * constructors to be exposed without having to use a factory or a composed object.
 *
 * @param {string} id - profile id
 * @param {object} content - profile content
 * @param {object} meta - profile metadata
 * @constructor
 */
Security.prototype.profile = function(id, content, meta) {
  return new Profile(this, id, content, meta);
};

/**
 * Get a specific user from kuzzle using its unique ID
 *
 * @param {string} id
 * @param {object|responseCallback} [options] - (optional) arguments
 * @param {responseCallback} cb - returns Kuzzle's response
 */
Security.prototype.fetchUser = function (id, options, cb) {
  var
    data = {_id: id},
    self = this;

  if (!id || typeof id !== 'string') {
    throw new Error('Id parameter is mandatory for fetchUser function');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.callbackRequired('Security.fetchUser', cb);

  self.kuzzle.query(this.buildQueryArgs('getUser'), data, options, function (err, response) {
    cb(err, err ? undefined : new User(self, response.result._id, response.result._source, response.result._meta));
  });
};

/**
 * Executes a search on user according to a filter
 *
 * /!\ There is a small delay between user creation and their existence in our persistent search layer,
 * usually a couple of seconds.
 * That means that a user that was just been created won’t be returned by this function.
 *
 * @param {Object} filters - same filters as documents filters
 * @param {object|responseCallback} [options] - (optional) arguments
 * @param {responseCallback} [cb] - returns Kuzzle's response
 */
Security.prototype.searchUsers = function (filters, options, cb) {
  var
    self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.callbackRequired('Security.searchUsers', cb);

  self.kuzzle.query(this.buildQueryArgs('searchUsers'), {body: filters}, options, function (error, response) {
    var
      documents,
      scrollId = null;

    if (error) {
      return cb(error);
    }

    documents = response.result.hits.map(function (doc) {
      return new User(self, doc._id, doc._source, doc._meta);
    });

    if (response.result.scrollId) {
      scrollId = response.result.scrollId;
    }

    cb(null, { total: response.result.total, users: documents, scrollId: scrollId });
  });
};

/**
 * Create a new user in Kuzzle.
 *
 * @param {string} id - user identifier
 * @param {object} content - attribute `profileIds` in `content` must only contain an array of profile ids
 * @param {object|responseCallback} [options] - (optional) arguments
 * @param {responseCallback} [cb] - (optional) Handles the query response
 */
Security.prototype.createUser = function (id, content, options, cb) {
  var
    self = this,
    data = {_id: id, body: content};

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(self.buildQueryArgs('createUser'), data, null, cb && function (err, res) {
    cb(err, err ? undefined : new User(self, res.result._id, res.result._source, res.result._meta));
  });
};

/**
 * Replace an user in Kuzzle.
 *
 * @param {string} id - user identifier
 * @param {object} content - attribute `profileIds` in `content` must only contain an array of profile ids
 * @param {object|responseCallback} [options] - (optional) arguments
 * @param {responseCallback} [cb] - (optional) Handles the query response
 */
Security.prototype.replaceUser = function (id, content, options, cb) {
  var
    self = this,
    data = {_id: id, body: content};

  if (!id || typeof id !== 'string') {
    throw new Error('Security.replaceUser: cannot replace a user without a user ID');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(this.buildQueryArgs('replaceUser'), data, options, cb && function (err, res) {
    cb(err, err ? undefined : new User(self, res.result._id, res.result._source, res.result._meta));
  });
};

/**
 * Create a new restricted user in Kuzzle.
 *
 * This function will create a new user. It is not usable to update an existing user.
 * This function allows anonymous users to create a "restricted" user with predefined rights.
 *
 * @param {string} id - user identifier
 * @param {object} content - attribute `profile` in `content` must only contains the profile id
 * @param {object|responseCallback} [options] - (optional) arguments
 * @param {responseCallback} [cb] - (optional) Handles the query response
 */
Security.prototype.createRestrictedUser = function (id, content, options, cb) {
  var
    self = this,
    data = {_id: id, body: content};

  if (content.profileIds) {
    throw new Error('Security.createRestrictedUser: cannot provide profileIds');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(this.buildQueryArgs('createRestrictedUser'), data, null, cb && function (err, res) {
    cb(err, err ? undefined : new User(self, res.result._id, res.result._source));
  });
};


/**
 * Update an user in Kuzzle.
 *
 * @param {string} id - user identifier
 * @param {object} content - a plain javascript object representing the user's modification
 * @param {object|responseCallback} [options] - (optional) arguments
 * @param {responseCallback} [cb] - (optional) Handles the query response
 * @returns {Security} this object
 */
Security.prototype.updateUser = function (id, content, options, cb) {
  var
    self = this,
    data = {},
    action = 'updateUser';

  if (!id || typeof id !== 'string') {
    throw new Error('Security.updateUser: cannot update an user without an user ID');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data._id = id;
  data.body = content;

  self.kuzzle.query(this.buildQueryArgs(action), data, options, cb && function (err, res) {
    cb(err, err ? undefined : new User(self, res.result._id, res.result._source, res.result._meta));
  });

  return this;
};

/**
 * Delete user.
 *
 * There is a small delay between user deletion and their deletion in our advanced search layer,
 * usually a couple of seconds.
 * That means that a user that was just been delete will be returned by this function
 *
 *
 * @param {string} id - Profile id to delete
 * @param {object|responseCallback} [options] - (optional) arguments
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {Security} this object
 */
Security.prototype.deleteUser = function (id, options, cb) {
  var data = {_id: id};

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.query(this.buildQueryArgs('deleteUser'), data, options, cb && function (err, res) {
    cb(err, err ? undefined : res.result._id);
  });

  return this;
};

/**
 * @param {string} scrollId
 * @param {object} [options]
 * @param {responseCallback} cb
 */
Security.prototype.scrollUsers = function (scrollId, options, cb) {
  var
    request = {},
    self = this;

  if (!scrollId) {
    throw new Error('Security.scrollUsers: scrollId is required');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = {};
  }

  this.kuzzle.callbackRequired('Security.scrollUsers', cb);

  request.scrollId = scrollId;

  if (options && options.scroll) {
    request.scroll = options.scroll;
  }

  this.kuzzle.query({controller: 'security', action: 'scrollUsers'}, request, options, function (error, result) {
    var users = [];

    if (error) {
      return cb(error);
    }

    result.result.hits.forEach(function (user) {
      var newUser = new User(self, user._id, user._source, user._meta);

      newUser.version = user._version;

      users.push(newUser);
    });

    cb(null, {
      total: result.result.total,
      users: users,
      scrollId: scrollId
    });
  });

  return this;
};

/**
 * Instantiate a new User object. Workaround to the module.exports limitation, preventing multiple
 * constructors to be exposed without having to use a factory or a composed object.
 *
 * @param {string} id - user id
 * @param {object} content - user content
 * @param {object} meta - user metadata
 * @constructor
 */
Security.prototype.user = function(id, content, meta) {
  return new User(this, id, content, meta);
};

/**
 * Tells whether an action is allowed, denied or conditional based on the rights
 * rights provided as the first argument. An action is defined as a couple of
 * action and controller (mandatory), plus an index and a collection(optional).
 *
 * @param {object} rights - The rights rights associated to a user
 *                            (see getMyrights and getUserrights).
 * @param {string} controller - The controller to check the action onto.
 * @param {string} action - The action to perform.
 * @param {string} index - (optional) The name of index to perform the action onto.
 * @param {string} collection - (optional) The name of the collection to perform the action onto.
 *
 * @returns {string} ['allowed', 'denied', 'conditional'] where conditional cases
 *                   correspond to rights containing closures.
 *                   See also http://kuzzle.io/guide/#roles-definition
 */
Security.prototype.isActionAllowed = function(rights, controller, action, index, collection) {
  var filteredRights;

  if (!rights || typeof rights !== 'object') {
    throw new Error('rights parameter is mandatory for isActionAllowed function');
  }
  if (!controller || typeof controller !== 'string') {
    throw new Error('controller parameter is mandatory for isActionAllowed function');
  }
  if (!action || typeof action !== 'string') {
    throw new Error('action parameter is mandatory for isActionAllowed function');
  }

  // We filter in all the rights that match the request (including wildcards).
  filteredRights = rights
    .filter(function (right) {
      return right.controller === controller || right.controller === '*';
    })
    .filter(function (right) {
      return right.action === action || right.action === '*';
    })
    .filter(function (right) {
      return right.index === index || right.index === '*';
    })
    .filter(function (right) {
      return right.collection === collection || right.collection === '*';
    });

  // Then, if at least one right allows the action, we return 'allowed'
  if (filteredRights.some(function (item) { return item.value === 'allowed'; })) {
    return 'allowed';
  }
  // If no right allows the action, we check for conditionals.
  if (filteredRights.some(function (item) { return item.value === 'conditional'; })) {
    return 'conditional';
  }
  // Otherwise we return 'denied'.
  return 'denied';
};


/**
 * Gets the rights array of a given user.
 *
 * @param {string} userId The id of the user.
 * @param {object|responseCallback} [options] - (optional) arguments
 * @param {function} cb The callback containing the normalized array of rights.
 */
Security.prototype.getUserRights = function (userId, options, cb) {
  var
    data = {_id: userId},
    self = this;

  if (!userId || typeof userId !== 'string') {
    throw new Error('userId parameter is mandatory for getUserRights function');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.callbackRequired('Kuzzle.getUserRights', cb);

  this.kuzzle.query(this.buildQueryArgs('getUserRights'), data, options, cb && function (err, res) {
    cb(err, err ? undefined : res.result.hits);
  });
};

/**
 * Create credentials of the specified <strategy> for the user <kuid>.
 *
 * @param strategy
 * @param kuid
 * @param credentials
 * @param options
 * @param cb
 * @returns {Security}
 */
Security.prototype.createCredentials = function (strategy, kuid, credentials, options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.query({controller: 'security', action: 'createCredentials'}, {_id: kuid, strategy: strategy, body: credentials}, options, function(err, res) {
    if (!err) {
      cb && cb(null, res.result._source);
    } else {
      cb && cb(err);
    }
  });

  return this;
};

/**
 * Delete credentials of the specified <strategy> for the user <kuid> .
 *
 * @param strategy
 * @param kuid
 * @param options
 * @param cb
 * @returns {Security}
 */
Security.prototype.deleteCredentials = function (strategy, kuid, options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.query({controller: 'security', action: 'deleteCredentials'}, {strategy: strategy, _id: kuid}, options, typeof cb !== 'function' ? null : function(err, res) {
    if (!err) {
      cb && cb(null, res.result);
    } else {
      cb && cb(err);
    }
  });

  return this;
};

/**
 * Retrieve a list of accepted fields per authentication strategy.
 *
 * @param options
 * @param cb
 */
Security.prototype.getAllCredentialFields = function (options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.query({controller: 'security', action: 'getAllCredentialFields'}, {}, options, typeof cb !== 'function' ? null : function(err, res) {
    if (!err) {
      cb && cb(null, res.result);
    } else {
      cb && cb(err);
    }
  });
};

/**
 * Retrieve the list of accepted field names by the specified <strategy>.
 *
 * @param strategy
 * @param options
 * @param cb
 */
Security.prototype.getCredentialFields = function (strategy, options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.query({controller: 'security', action: 'getCredentialFields'}, {strategy: strategy}, options, typeof cb !== 'function' ? null : function(err, res) {
    if (!err) {
      cb && cb(null, res.result);
    } else {
      cb && cb(err);
    }
  });
};

/**
 * Get credential information of the specified <strategy> for the user <kuid>.
 *
 * @param strategy
 * @param kuid
 * @param options
 * @param cb
 */
Security.prototype.getCredentials = function (strategy, kuid, options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.query({controller: 'security', action: 'getCredentials'}, {strategy: strategy, _id: kuid}, options, typeof cb !== 'function' ? null : function(err, res) {
    if (!err) {
      cb && cb(null, res.result);
    } else {
      cb && cb(err);
    }
  });
};

/**
 * Check the existence of the specified <strategy>’s credentials for the user <kuid>.
 *
 * @param strategy
 * @param kuid
 * @param options
 * @param cb
 */
Security.prototype.hasCredentials = function (strategy, kuid, options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.query({controller: 'security', action: 'hasCredentials'}, {strategy: strategy, _id: kuid}, options, typeof cb !== 'function' ? null : function(err, res) {
    if (!err) {
      cb && cb(null, res.result);
    } else {
      cb && cb(err);
    }
  });
};

/**
 * Updates credentials of the specified <strategy> for the user <kuid>.
 *
 * @param strategy
 * @param kuid
 * @param credentials
 * @param options
 * @param cb
 * @returns {Security}
 */
Security.prototype.updateCredentials = function (strategy, kuid, credentials, options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.query({controller: 'security', action: 'updateCredentials'}, {strategy: strategy, _id: kuid, body: credentials}, options, typeof cb !== 'function' ? null : function(err, res) {
    if (!err) {
      cb && cb(null, res.result);
    } else {
      cb && cb(err);
    }
  });

  return this;
};

/**
 * Validate credentials of the specified <strategy> for the user <kuid>.
 *
 * @param strategy
 * @param kuid
 * @param credentials
 * @param options
 * @param cb
 */
Security.prototype.validateCredentials = function (strategy, kuid, credentials, options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.query({controller: 'security', action: 'validateCredentials'}, {strategy: strategy, _id: kuid, body: credentials}, options, typeof cb !== 'function' ? null : function(err, res) {
    if (!err) {
      cb && cb(null, res.result);
    } else {
      cb && cb(err);
    }
  });
};

module.exports = Security;
