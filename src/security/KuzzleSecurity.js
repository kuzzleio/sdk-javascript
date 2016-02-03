var
  Role = require('./kuzzleRole'),
  Profile = require('./kuzzleProfile'),
  User = require('./kuzzleUser');

/**
 * Kuzzle security constructor
 *
 * @param kuzzle
 * @param headers
 * @returns {KuzzleSecurity}
 * @constructor
 */
function KuzzleSecurity(kuzzle, headers) {

  if (!headers) {
    headers = kuzzle.headers;
  }

  Object.defineProperties(this, {
    kuzzle: {
      value: kuzzle,
      enumerable: true
    },
    // writable properties
    //headers: {
    //  value: JSON.parse(JSON.stringify(headers)),
    //  enumerable: true,
    //  writable: true
    //}
  });

  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var blacklist = [];

        return passes && blacklist.indexOf(name) === -1;
      }
    });
  }

  return this;
}


/**
 * @param {string} name
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.fetchRole = function (name, cb) {

};
/**
 *
 * @param {object} filters
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.searchRoles = function (filters, options, cb) {
  
};

/**
 * 
 * @param {object} role
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.createRole = function (role, cb) {

};

/**
 * @param {string} name
 * @param {Boolean} hydrate
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.fetchProfile = function (name, hydrate, cb) {

};
/**
 *
 * @param {object} filters
 * @param {Boolean} hydrate
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.searchProfiles = function (filters, hydrate, cb) {

};

/**
 *
 * @param {object} profile
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.createProfile = function (profile, cb) {

};

/**
 * @param {string} name
 * @param {Boolean} hydrate
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.fetchUser = function (name, hydrate, cb) {

};
/**
 *
 * @param {object} filters
 * @param {Boolean} hydrate
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.searchUsers = function (filters, hydrate, cb) {

};

/**
 *
 * @param {object} profile
 * @param {responseCallback} [cb] - returns Kuzzle's response
 *
 * @returns {Object} this
 */
KuzzleSecurity.prototype.createUser = function (profile, cb) {

};


module.exports = KuzzleSecurity;