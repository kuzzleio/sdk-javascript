var
  KuzzleRole = require('./kuzzleRole'),
  KuzzleProfile = require('./kuzzleProfile'),
  KuzzleUser = require('./kuzzleUser');

/**
 * Kuzzle security constructor
 *
 * @param kuzzle
 * @returns {KuzzleSecurity}
 * @constructor
 */
function KuzzleSecurity(kuzzle) {

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
        var blacklist = ['roleFactory', 'profileFactory', 'userFactory', 'isActionAllowed'];

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
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - returns Kuzzle's response
 */
KuzzleSecurity.prototype.getRole = function (id, options, cb) {
  var
    data,
    self = this;

  if (!id) {
    throw new Error('Id parameter is mandatory for getRole function');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data = {_id: id};

  self.kuzzle.callbackRequired('KuzzleSecurity.getRole', cb);

  self.kuzzle.query(this.buildQueryArgs('getRole'), data, options, function (err, response) {
    cb(err, err ? undefined : new KuzzleRole(self, response.result._id, response.result._source));
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
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 */
KuzzleSecurity.prototype.searchRoles = function (filters, options, cb) {
  var
    self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.callbackRequired('KuzzleSecurity.searchRoles', cb);

  self.kuzzle.query(this.buildQueryArgs('searchRoles'), {body: filters}, options, function (error, result) {
    var documents;

    if (error) {
      return cb(error);
    }

    documents = result.result.hits.map(function (doc) {
      return new KuzzleRole(self, doc._id, doc._source);
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
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - (optional) Handles the query response
 */
KuzzleSecurity.prototype.createRole = function (id, content, options, cb) {
  var
    self = this,
    data = {},
    action = 'createRole';

  if (!id || typeof id !== 'string') {
    throw new Error('KuzzleSecurity.createRole: cannot create a role without a role ID');
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
    cb(err, err ? undefined : new KuzzleRole(self, res.result._id, res.result._source));
  });
};


/**
 * Update a role in Kuzzle.
 *
 * @param {string} id - role identifier
 * @param {object} content - a plain javascript object representing the role's modification
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - (optional) Handles the query response
 * @returns {KuzzleSecurity} this object
 */
KuzzleSecurity.prototype.updateRole = function (id, content, options, cb) {
  var
    self = this,
    data = {_id: id, body: content},
    action = 'updateRole';

  if (!id || typeof id !== 'string') {
    throw new Error('KuzzleSecurity.updateRole: cannot update a role without a role ID');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(this.buildQueryArgs(action), data, options, cb && function (err) {
    cb(err, err ? undefined : new KuzzleRole(self, id, content));
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
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {KuzzleSecurity} this object
 */
KuzzleSecurity.prototype.deleteRole = function (id, options, cb) {
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
 * Instantiate a new KuzzleRole object. Workaround to the module.exports limitation, preventing multiple
 * constructors to be exposed without having to use a factory or a composed object.
 *
 * @param {string} id - role id
 * @param {object} content - role content
 * @constructor
 */
KuzzleSecurity.prototype.roleFactory = function(id, content) {
  return new KuzzleRole(this, id, content);
};


/**
 * Get a specific profile from kuzzle
 *
 *
 * @param {string} id
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} cb - returns Kuzzle's response
 */
KuzzleSecurity.prototype.getProfile = function (id, options, cb) {
  var
    data,
    self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (!id || typeof id !== 'string') {
    throw new Error('Id parameter is mandatory for getProfile function');
  }


  data = {_id: id};

  self.kuzzle.callbackRequired('KuzzleSecurity.getProfile', cb);

  self.kuzzle.query(this.buildQueryArgs('getProfile'), data, options, function (error, response) {
    cb(error, error ? undefined : new KuzzleProfile(self, response.result._id, response.result._source));
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
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - returns Kuzzle's response
 */
KuzzleSecurity.prototype.searchProfiles = function (filters, options, cb) {
  var
    self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.callbackRequired('KuzzleSecurity.searchProfiles', cb);

  self.kuzzle.query(this.buildQueryArgs('searchProfiles'), {body: filters}, options, function (error, response) {
    var documents;

    if (error) {
      return cb(error);
    }

    documents = response.result.hits.map(function (doc) {
      return new KuzzleProfile(self, doc._id, doc._source);
    });

    cb(null, { total: response.result.total, profiles: documents });
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
 * @param {object} content - attribute `roles` in `content` must only contains an array of role id
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - (optional) Handles the query response
 */
KuzzleSecurity.prototype.createProfile = function (id, content, options, cb) {
  var
    self = this,
    data = {},
    action = 'createProfile';

  if (!id || typeof id !== 'string') {
    throw new Error('KuzzleSecurity.createProfile: cannot create a profile without a profile ID');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data._id = id;
  data.body = content;

  if (options) {
    action = options.replaceIfExist ? 'createOrReplaceProfile' : 'createProfile';
  }

  self.kuzzle.query(this.buildQueryArgs(action), data, options, cb && function (err, res) {
    cb(err, err ? undefined : new KuzzleProfile(self, res.result._id, res.result._source));
  });
};


/**
 * Update a profile in Kuzzle.
 *
 * @param {string} id - profile identifier
 * @param {object} content - a plain javascript object representing the profile's modification
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - (optional) Handles the query response
 * @returns {KuzzleSecurity} this object
 */
KuzzleSecurity.prototype.updateProfile = function (id, content, options, cb) {
  var
    self = this,
    data = {},
    action = 'updateProfile';

  if (!id || typeof id !== 'string') {
    throw new Error('KuzzleSecurity.updateProfile: cannot update a profile without a profile ID');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data._id = id;
  data.body = content;

  self.kuzzle.query(this.buildQueryArgs(action), data, options, cb && function (err, res) {
    var updatedContent = {};

    if (err) {
      return cb(err);
    }

    Object.keys(res.result._source).forEach(function (property) {
      updatedContent[property] = res.result._source[property];
    });

    cb(null, new KuzzleProfile(self, res.result._id, updatedContent));
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
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {KuzzleSecurity} this object
 */
KuzzleSecurity.prototype.deleteProfile = function (id, options, cb) {
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
 * Instantiate a new KuzzleProfile object. Workaround to the module.exports limitation, preventing multiple
 * constructors to be exposed without having to use a factory or a composed object.
 *
 * @param {string} id - profile id
 * @param {object} content - profile content
 * @constructor
 */
KuzzleSecurity.prototype.profileFactory = function(id, content) {
  return new KuzzleProfile(this, id, content);
};

/**
 * Get a specific user from kuzzle using its unique ID
 *
 * @param {string} id
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} cb - returns Kuzzle's response
 */
KuzzleSecurity.prototype.getUser = function (id, options, cb) {
  var
    data = {_id: id},
    self = this;

  if (!id || typeof id !== 'string') {
    throw new Error('Id parameter is mandatory for getUser function');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.callbackRequired('KuzzleSecurity.getUser', cb);

  self.kuzzle.query(this.buildQueryArgs('getUser'), data, options, function (err, response) {
    cb(err, err ? undefined : new KuzzleUser(self, response.result._id, response.result._source));
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
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - returns Kuzzle's response
 */
KuzzleSecurity.prototype.searchUsers = function (filters, options, cb) {
  var
    self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.callbackRequired('KuzzleSecurity.searchUsers', cb);

  self.kuzzle.query(this.buildQueryArgs('searchUsers'), {body: filters}, options, function (error, response) {
    var documents;

    if (error) {
      return cb(error);
    }

    documents = response.result.hits.map(function (doc) {
      return new KuzzleUser(self, doc._id, doc._source);
    });

    cb(null, { total: response.result.total, users: documents });
  });
};

/**
 * Create a new user in Kuzzle.
 *
 * Takes an optional argument object with the following property:
 *    - replaceIfExist (boolean, default: false):
 *        If the same user already exists: throw an error if sets to false.
 *        Replace the existing user otherwise
 *
 * @param {string} id - user identifier
 * @param {object} content - attribute `profile` in `content` must only contains the profile id
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - (optional) Handles the query response
 */
KuzzleSecurity.prototype.createUser = function (id, content, options, cb) {
  var
    self = this,
    data = {_id: id, body: content},
    action = 'createUser';

  if (!id || typeof id !== 'string') {
    throw new Error('KuzzleSecurity.createUser: cannot create a user without a user ID');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (options) {
    action = options.replaceIfExist ? 'createOrReplaceUser' : 'createUser';
  }

  self.kuzzle.query(this.buildQueryArgs(action), data, null, cb && function (err, res) {
    cb(err, err ? undefined : new KuzzleUser(self, res.result._id, res.result._source));
  });
};


/**
 * Update an user in Kuzzle.
 *
 * @param {string} id - user identifier
 * @param {object} content - a plain javascript object representing the user's modification
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - (optional) Handles the query response
 * @returns {KuzzleSecurity} this object
 */
KuzzleSecurity.prototype.updateUser = function (id, content, options, cb) {
  var
    self = this,
    data = {},
    action = 'updateUser';

  if (!id || typeof id !== 'string') {
    throw new Error('KuzzleSecurity.updateUser: cannot update an user without an user ID');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data._id = id;
  data.body = content;

  self.kuzzle.query(this.buildQueryArgs(action), data, options, cb && function (err, res) {
    cb(err, err ? undefined : new KuzzleUser(self, res.result._id, res.result._source));
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
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {KuzzleSecurity} this object
 */
KuzzleSecurity.prototype.deleteUser = function (id, options, cb) {
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
 * Instantiate a new KuzzleUser object. Workaround to the module.exports limitation, preventing multiple
 * constructors to be exposed without having to use a factory or a composed object.
 *
 * @param {string} id - user id
 * @param {object} content - user content
 * @constructor
 */
KuzzleSecurity.prototype.userFactory = function(id, content) {
  return new KuzzleUser(this, id, content);
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
KuzzleSecurity.prototype.isActionAllowed = function(rights, controller, action, index, collection) {
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
 * @param {object} [options] - (optional) arguments
 * @param {function} cb   The callback containing the normalized array of rights.
 */
KuzzleSecurity.prototype.getUserRights = function (userId, options, cb) {
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

module.exports = KuzzleSecurity;
