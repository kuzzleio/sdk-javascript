var
  KuzzleSecurityDocument = require('./kuzzleSecurityDocument');

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
        var whitelist = ['save'];

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
 * @param {array} profile - an array of profiles ids string
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
 * @param {string} profile - a profile ids string
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
 * @param {responseCallback} [cb] - Handles the query response
 * @param {object} [options] - Optional parameters
 * @returns {*} this
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
