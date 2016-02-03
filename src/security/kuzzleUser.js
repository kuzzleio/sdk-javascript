function KuzzleUser() {
  // Define properties
  Object.defineProperties(this, {
    // private properties
    // read-only properties
    // writable properties
  });

  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['getProfiles', 'save'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

  return this;
}

/**
 * @param {Boolean} hydrate
 *
 * @returns {Object} this
 */
KuzzleUser.prototype.getProfiles = function (hydrate) {

};

/**
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 *
 * @returns {Object} this
 */
KuzzleUser.prototype.save = function (options, cb) {

};

/**
 *
 * @param {Object} data - New user content
 * 
 * @return {Object} KuzzleUser
 */
KuzzleUser.prototype.setContent = function (data) {

};

module.exports = KuzzleUser;
