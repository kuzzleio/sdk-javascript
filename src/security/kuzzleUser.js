var
  KuzzleSecurityDocument = require('./kuzzleSecurityDocument');

/**
 * @param {KuzzleSecurity} kuzzleSecurity
 * @param {string} id
 * @param {Object} content
 * @constructor
 */
function KuzzleUser(kuzzleSecurity, id, content) {

  KuzzleSecurityDocument.call(this, kuzzleSecurity, id, content);

  // Define properties
  Object.defineProperties(this, {
    // private properties
    deleteActionName: {
      value: 'deleteUser'
    },
    updateActionName: {
      value: 'updateUser'
    }
  });

  // promisifying
  if (kuzzleSecurity.kuzzle.bluebird) {
    return kuzzleSecurity.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['save', 'saveRestricted'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }
}

KuzzleUser.prototype = Object.create(KuzzleSecurityDocument.prototype, {
  constructor: {
    value: KuzzleUser
  }
});

/**
 * Set profiles in content
 * @param {array} profileIds - an array of profiles ids string
 *
 * @returns {KuzzleUser} this
 */
KuzzleUser.prototype.setProfiles = function (profileIds) {
  if (!Array.isArray(profileIds) || typeof profileIds[0] !== 'string') {
    throw new Error('Parameter "profileIds" must be an array of strings');
  }

  this.content.profileIds = profileIds;

  return this;
};

/**
 * Add a profile
 * @param {string} profileId - a profile ids string
 *
 * @returns {KuzzleUser} this
 */
KuzzleUser.prototype.addProfile = function (profileId) {
  if (typeof profileId !== 'string') {
    throw new Error('Parameter "profileId" must be a string');
  }

  if (!this.content.profileIds) {
    this.content.profileIds = [];
  }

  if (this.content.profileIds.indexOf(profileId) === -1) {
    this.content.profileIds.push(profileId);
  }

  return this;
};

/**
 * Saves this user into Kuzzle.
 *
 * If this is a new user, this function will create it in Kuzzle.
 * Otherwise, this method will replace the latest version of this user in Kuzzle by the current content
 * of this object.
 *
 * @param {object|responseCallback} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {KuzzleUser} this
 */
KuzzleUser.prototype.save = function (options, cb) {
  var
    data = this.serialize(),
    self = this;

  if (options && cb === undefined && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(this.kuzzleSecurity.buildQueryArgs('createOrReplaceUser'), data, options, cb && function (error) {
    cb(error, error ? undefined : self);
  });

  return self;
};

/**
 * Saves this user as restricted into Kuzzle.
 *
 * This function will create a new user. It is not usable to update an existing user.
 * The "profileIds" property must not be provided, or the request will be rejected by Kuzzle.
 * This function allows anonymous users to create a "restricted" user with predefined rights.
 *
 * @param {object|responseCallback} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {KuzzleUser} this
 */
KuzzleUser.prototype.saveRestricted = function (options, cb) {
  var
    data = this.serialize(),
    self = this;

  if (options && cb === undefined && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(this.kuzzleSecurity.buildQueryArgs('createRestrictedUser'), data, options, cb && function (error) {
    cb(error, error ? undefined : self);
  });

  return self;
};

/**
 * Serialize this object into a JSON object
 *
 * @return {object} JSON object representing this User
 */
KuzzleUser.prototype.serialize = function () {
  return {_id: this.id, body: this.content};
};

/**
 * Return the associated profiles IDs
 *
 * @return {array} the associated profiles IDs
 */
KuzzleUser.prototype.getProfiles = function () {
  return this.content.profileIds;
};

module.exports = KuzzleUser;
