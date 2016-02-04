function KuzzleUser(kuzzle, id, content) {
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

  Object.defineProperty(this, 'kuzzle', {
    value: kuzzle
  });

  // handling provided arguments
  if (!content && id && typeof id === 'object') {
    content = id;
    id = null;
  }

  if (content) {
    this.setContent(content);
  }

  if (id) {
    Object.defineProperty(this, 'id', {
      value: id,
      enumerable: true
    });
  }

  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['hydrate', 'save'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

  return this;
}

/**
 *
 */
KuzzleUser.prototype.hydrate = function () {

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
 * @return {Object} this
 */
KuzzleUser.prototype.setContent = function (data) {

};

module.exports = KuzzleUser;
