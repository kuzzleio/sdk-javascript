var SecurityDocument = require('./SecurityDocument');

function Profile(Security, id, content, meta) {

  SecurityDocument.call(this, Security, id, content, meta);

  // Define properties
  Object.defineProperties(this, {
    // private properties
    deleteActionName: {
      value: 'deleteProfile'
    },
    updateActionName: {
      value: 'updateProfile'
    }
  });

  // promisifying
  if (Security.kuzzle.bluebird) {
    return Security.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['hydrate', 'save'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

}

Profile.prototype = Object.create(SecurityDocument.prototype, {
  constructor: {
    value: Profile
  }
});

/**
 * Persist to the persistent layer the current profile
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {Profile} this
 */
Profile.prototype.save = function (options, cb) {
  var
    data,
    self = this;

  if (!this.content.policies) {
    throw new Error('Argument "policies" is mandatory in a profile. This argument contains an array of objects.');
  }

  if (options && cb === undefined && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data = this.serialize();

  self.kuzzle.query(self.Security.buildQueryArgs('createOrReplaceProfile'), data, options, cb && function (error) {
    cb(error, error ? undefined : self);
  });

  return self;
};


/**
 * Add a policy in the policies list
 * @param {Object} policy - must be an object containing at least a "roleId" member which must be a string.
 *
 * @returns {Profile} this
 */
Profile.prototype.addPolicy = function (policy) {

  if (typeof policy !== 'object' || typeof policy.roleId !== 'string') {
    throw new Error('Parameter "policies" must be an object containing at least a "roleId" member which must be a string.');
  }

  if (!this.content.policies) {
    this.content.policies = [];
  }

  this.content.policies.push(policy);

  return this;
};

/**
 * Set policies list
 * @param {Array} policies - must be an array of objects containing at least a "roleId" member which must be a string
 *
 * @returns {Profile} this
 */
Profile.prototype.setPolicies = function (policies) {

  if (!Array.isArray(policies)) {
    throw new Error('Parameter "policies" must be an array of objects containing at least a "roleId" member which must be a string');
  }

  policies.map(function (policy) {
    if (typeof policy !== 'object' || typeof policy.roleId !== 'string') {
      throw new Error('Parameter "policies" must be an array of objects containing at least a "roleId" member which must be a string');
    }
  });

  this.content.policies = policies;

  return this;
};

/**
 * Serialize this object into a JSON object
 *
 * @return {object} JSON object representing this securityDocument
 */
Profile.prototype.serialize = function () {
  var
    data = {};

  if (this.id) {
    data._id = this.id;
  }

  data.body = this.content;
  data.meta = this.meta;

  return data;
};

/**
 * Returns the list of policies associated to this profile.
 * Each policy element is an array of objects containing at least a "roleId" member which must be a string
 *
 * @return {object} an array of policies
 */
Profile.prototype.getPolicies = function () {
  return this.content.policies;
};

module.exports = Profile;
