var
  KuzzleSecurityDocument = require('./kuzzleSecurityDocument');

function KuzzleProfile(kuzzleSecurity, id, content) {

  KuzzleSecurityDocument.call(this, kuzzleSecurity, id, content);

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
 * @returns {Object} this
 */
KuzzleProfile.prototype.save = function (options, cb) {
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

  self.kuzzle.query(self.kuzzleSecurity.buildQueryArgs('createOrReplaceProfile'), data, options, function (error) {
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
 * Add a policy in the policies list
 * @param {Object} role - must be an object containing at least a "roleId" member which must be a string.
 *
 * @returns {KuzzleProfile} this
 */
KuzzleProfile.prototype.addPolicy = function (policy) {

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
 * @returns {KuzzleProfile} this
 */
KuzzleProfile.prototype.setPolicies = function (policies) {

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
KuzzleProfile.prototype.serialize = function () {
  var
    data = {};

  if (this.id) {
    data._id = this.id;
  }

  data.body = this.content;
  if (!data.body.policies || !Array.isArray(data.body.policies)) {
    return data;
  }

  return data;
};

/**
 * Returns the list of policies associated to this profile.
 * Each policy element is an array of objects containing at least a "roleId" member which must be a string
 *
 * @return {object} an array of policies
 */
KuzzleProfile.prototype.getPolicies = function () {
  return this.content.policies;
};

module.exports = KuzzleProfile;
