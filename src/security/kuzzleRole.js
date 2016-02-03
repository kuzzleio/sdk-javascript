function KuzzleRole(roleId, content) {
  // Define properties
  Object.defineProperties(this, {
    // private properties
    // read-only properties
    // writable properties
    id: {
      value: undefined,
      enumerable: true,
      writable: true
    },
    content: {
      value: {},
      writable: true,
      enumerable: true
    }
  });

  // handling provided arguments
  if (!content && roleId && typeof roleId === 'object') {
    content = roleId;
    roleId = null;
  }

  if (content) {
    this.setContent(content);
  }

  if (roleId) {
    Object.defineProperty(this, 'id', {
      value: roleId,
      enumerable: true
    });
  }

  // promisifying
  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['save'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

  return this;
}

/**
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 *
 * @returns {Object} this
 */
KuzzleRole.prototype.save = function (options, cb) {

};

/**
 *
 * @param {Object} data - New role content
 *
 * @return {Object} this
 */
KuzzleRole.prototype.setContent = function (data) {

};

module.exports = KuzzleRole;
