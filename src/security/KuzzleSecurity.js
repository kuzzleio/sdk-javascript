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
        var blacklist = ['roleFactory', 'profileFactory', 'userFactory'];

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
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.getRole = function (id, cb) {
  var
    data = {_id: id},
    self = this;

  self.kuzzle.callbackRequired('KuzzleSecurity.getRole', cb);

  self.kuzzle.query(this.buildQueryArgs('getRole'), data, null, function (err, response) {
    if (err) {
      return cb(err);
    }

    cb(null, new KuzzleRole(self, response.result._id, response.result._source));
  });

  return this;
};

/**
 * Executes a search on roles according to a filter
 *
 * /!\ There is a small delay between role creation and their existence in our persistent search layer,
 * usually a couple of seconds.
 * That means that a role that was just been created won’t be returned by this function.
 *
 * @param {Object} filters - this object can contains an array `indexes` with a list of index id, a integer `from` and a integer `size`
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.searchRoles = function (filters, cb) {
  var
    self = this;

  self.kuzzle.callbackRequired('KuzzleSecurity.searchRoles', cb);

  self.kuzzle.query(this.buildQueryArgs('searchRoles'), {body: filters}, null, function (error, result) {
    var documents;

    if (error) {
      return cb(error);
    }

    documents = result.result.hits.map(function (doc) {
      return new KuzzleRole(self, doc._id, doc._source);
    });

    cb(null, { total: result.result.total, documents: documents });
  });

  return this;
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
 * @returns {Object} this
 */
KuzzleSecurity.prototype.createRole = function (id, content, options, cb) {
  var
    self = this,
    data = {},
    action = 'createRole';

  if (id && typeof id !== 'string') {
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

  if (cb) {
    self.kuzzle.query(this.buildQueryArgs(action), data, null, function (err, res) {
      var doc;

      if (err) {
        return cb(err);
      }

      doc = new KuzzleRole(self, res.result._id, res.result._source);
      cb(null, doc);
    });
  } else {
    self.kuzzle.query(this.buildQueryArgs(action), data);
  }

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
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {Object} this
 */
KuzzleSecurity.prototype.deleteRole = function (id, cb) {
  var data = {_id: id};

  if (cb) {
    this.kuzzle.query(this.buildQueryArgs('deleteRole'), data, null, function (err, res) {
      if (err) {
        return cb(err);
      }

      cb(null, res.result._id);
    });
  } else {
    this.kuzzle.query(this.buildQueryArgs('deleteRole'), data);
  }

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
 * @param {string} id
 * @param {responseCallback} cb - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.getProfile = function (id, cb) {
  var
    self = this;

  self.kuzzle.callbackRequired('KuzzleSecurity.getProfile', cb);

  self.kuzzle.query(this.buildQueryArgs('getProfile'), {_id: id}, null, function (error, response) {
    if (error) {
      return cb(error);
    }

    cb(null, new KuzzleProfile(self, response.result._id, response.result._source));
  });

  return this;
};

/**
 * Executes a search on profiles according to a filter
 *
 * /!\ There is a small delay between profile creation and their existence in our persistent search layer,
 * usually a couple of seconds.
 * That means that a profile that was just been created won’t be returned by this function.
 *
 * @param {Object} filters - this object can contains an array `roles` with a list of roles id, a integer `from` and a integer `size`
 * @param {Boolean} [hydrate] - if hydrate is true, profiles will have a list of Role object instead of just a list of role id
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.searchProfiles = function (filters, hydrate, cb) {
  var
    self = this;

  if (!cb && typeof hydrate === 'function') {
    cb = hydrate;
    hydrate = false;
  }

  filters.hydrate = hydrate;

  self.kuzzle.callbackRequired('KuzzleSecurity.searchProfiles', cb);

  self.kuzzle.query(this.buildQueryArgs('searchProfiles'), {body: filters}, null, function (error, response) {
    var documents;

    if (error) {
      return cb(error);
    }

    documents = response.result.hits.map(function (doc) {
      return new KuzzleProfile(self, doc._id, doc._source);
    });

    cb(null, { total: response.result.total, documents: documents });
  });

  return this;
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
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.createProfile = function (id, content, options, cb) {
  var
    self = this,
    data = {},
    action = 'createProfile';

  if (id && typeof id !== 'string') {
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

  if (cb) {
    self.kuzzle.query(this.buildQueryArgs(action), data, null, function (err, res) {
      var doc;

      if (err) {
        return cb(err);
      }

      doc = new KuzzleProfile(self, res.result._id, res.result._source);
      cb(null, doc);
    });
  } else {
    self.kuzzle.query(this.buildQueryArgs(action), data);
  }

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
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {Object} this
 */
KuzzleSecurity.prototype.deleteProfile = function (id, cb) {
  var data = {_id: id};

  if (cb) {
    this.kuzzle.query(this.buildQueryArgs('deleteProfile'), data, null, function (err, res) {
      if (err) {
        return cb(err);
      }

      cb(null, res.result._id);
    });
  } else {
    this.kuzzle.query(this.buildQueryArgs('deleteProfile'), data);
  }

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
 * Retrieve a single User using its unique user ID.
 *
 * @param {string} id
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.getUser = function (id, cb) {
  var
    data = {_id: id},
    self = this;

  self.kuzzle.callbackRequired('KuzzleSecurity.getUser', cb);

  self.kuzzle.query(this.buildQueryArgs('getUser'), data, null, function (err, response) {
    if (err) {
      return cb(err);
    }

    cb(null, new KuzzleUser(self, response.result._id, response.result._source));
  });

  return this;
};

/**
 * Executes a search on user according to a filter
 *
 * /!\ There is a small delay between user creation and their existence in our persistent search layer,
 * usually a couple of seconds.
 * That means that a user that was just been created won’t be returned by this function.
 *
 * @param {Object} filters - same filters as documents filters
 * @param {Boolean} hydrate - if hydrate is true, users will have a Profile object instead of just a profile id
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.searchUsers = function (filters, hydrate, cb) {
  var
    self = this;

  if (!cb && typeof hydrate === 'function') {
    cb = hydrate;
    hydrate = false;
  }

  filters.hydrate = hydrate;

  self.kuzzle.callbackRequired('KuzzleSecurity.searchUsers', cb);

  self.kuzzle.query(this.buildQueryArgs('searchUsers'), {body: filters}, null, function (error, response) {
    var documents;

    if (error) {
      return cb(error);
    }

    documents = response.result.hits.map(function (doc) {
      return new KuzzleUser(self, doc._id, doc._source);
    });

    cb(null, { total: response.result.total, documents: documents });
  });

  return this;
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
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.createUser = function (id, content, options, cb) {
  var
    self = this,
    data = {},
    action = 'createUser';

  if (id && typeof id !== 'string') {
    throw new Error('KuzzleSecurity.createUser: cannot create a user without a user ID');
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data._id = id;
  data.body = content;

  if (options) {
    action = options.replaceIfExist ? 'createOrReplaceUser' : 'createUser';
  }

  if (cb) {
    self.kuzzle.query(this.buildQueryArgs(action), data, null, function (err, res) {
      var doc;

      if (err) {
        return cb(err);
      }

      doc = new KuzzleUser(self, res.result._id, res.result._source);
      cb(null, doc);
    });
  } else {
    self.kuzzle.query(this.buildQueryArgs(action), data);
  }

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
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {Object} this
 */
KuzzleSecurity.prototype.deleteUser = function (id, cb) {
  var data = {_id: id};

  if (cb) {
    this.kuzzle.query(this.buildQueryArgs('deleteUser'), data, null, function (err, res) {
      if (err) {
        return cb(err);
      }

      cb(null, res.result._id);
    });
  } else {
    this.kuzzle.query(this.buildQueryArgs('deleteUser'), data);
  }

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


module.exports = KuzzleSecurity;