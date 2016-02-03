function KuzzleProfile() {
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
        var whitelist = ['getRoles', 'save'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

  return this;
}

/**
 * @param {Boolean} hydrate
 * @returns {Object} this
 */
KuzzleProfile.prototype.getRoles = function (hydrate) {

};

/**
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {Object} this
 */
KuzzleProfile.prototype.save = function (options, cb) {

};

/**
 *
 * @param {Object} data - New profile content
 * @return {Object} this
 */
KuzzleProfile.prototype.setContent = function (data) {

};

module.exports = KuzzleProfile;
