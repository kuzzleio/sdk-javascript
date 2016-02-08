var
  KuzzleSecurityDocument = require('./kuzzleSecurityDocument'),
  KuzzleRole = require('./kuzzleRole');

function KuzzleProfile(kuzzleSecurity, id, content) {

  KuzzleSecurityDocument.call(this, kuzzleSecurity, id, content);

  // Hydrate profile with roles if roles are not only string but objects with `_id` and `_source`
  if (content && content.roles) {
    content.roles = content.roles.map(function (role) {
      if (!role._id || !role._source) {
        return role;
      }

      return new KuzzleRole(kuzzleSecurity, role._id, role._source);
    })
  }

  // promisifying
  if (kuzzleSecurity.kuzzle.bluebird) {
    return kuzzleSecurity.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['hydrate', 'save'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

}

KuzzleProfile.prototype = Object.create(KuzzleSecurityDocument.prototype, {
  constructor: {
    value: KuzzleProfile
  }
});

/**
 * Persist to the persistent layer the current profile
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 *
 * @returns {Object} this
 */
KuzzleProfile.prototype.save = function (options, cb) {
  var
    data = this.toJSON(),
    self = this;

  self.kuzzle.callbackRequired('KuzzleProfile.save', cb);

  self.kuzzle.query(self.kuzzleSecurity.buildQueryArgs('createOrReplaceProfile'), data, null, function (error) {
    if (error) {
      return cb ? cb(error) : false;
    }

    if (cb) {
      cb(null, self);
    }
  });

  return self;
};


/**
 * Add a role in the roles list
 * @param {KuzzleRole|string} role - can be an instance of KuzzleRole or an id in string
 *
 * @returns {KuzzleProfile} this
 */
KuzzleProfile.prototype.addRole = function (role) {

  if (typeof role !== 'string' && !(role instanceof KuzzleRole)) {
    throw new Error('Parameter "roles" must be a KuzzleRole or a id string');
  }

  if (!this.content.roles) {
    this.content.roles = [];
  }

  this.content.roles.push(role);

  return this;
};

/**
 * Set roles list
 * @param {Array} roles - can be an array of KuzzleRole or an array of string
 *
 * @returns {KuzzleProfile} this
 */
KuzzleProfile.prototype.setRoles = function (roles) {

  if (!Array.isArray(roles)) {
    throw new Error('Parameter "roles" must be an array of KuzzleRole or an array of string');
  }

  this.content.roles = roles;

  return this;
};


/**
 * @param {responseCallback} [cb] - Handles the query response
 */
KuzzleProfile.prototype.hydrate = function (cb) {

  var
    self = this,
    data = {ids: self.content.roles};

  self.kuzzle.callbackRequired('KuzzleProfile.hydrate', cb);

  self.kuzzle.query(self.kuzzleSecurity.buildQueryArgs('mGetRoles'), data, null, function (error, response) {
    if (error) {
      return cb(error);
    }

    self.content.roles = response.result.hits.map(function(role) {
      return new KuzzleRole(self.kuzzleSecurity, role._id, role._source);
    });

    cb(null, self);
  });
};

/**
 * Serialize this object into a JSON object
 *
 * @return {object} JSON object representing this securityDocument
 */
KuzzleProfile.prototype.toJSON = function () {
  var
    data = {};

  if (this.id) {
    data._id = this.id;
  }

  data.body = this.content;

  data.body.roles = data.body.roles.map(function(role) {
    return role.id;
  });

  return data;
};


module.exports = KuzzleProfile;
