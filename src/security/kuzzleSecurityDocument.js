function KuzzleSecurityDocument(kuzzleSecurity, id, content) {

  if (!id) {
    throw new Error('A security document must have an id');
  }

  // Define properties
  Object.defineProperties(this, {
    // private properties
    kuzzle: {
      value: kuzzleSecurity.kuzzle
    },
    kuzzleSecurity: {
      value: kuzzleSecurity
    },
    // read-only properties
    // writable properties
    id: {
      value: id,
      enumerable: true
    },
    content: {
      value: {},
      writable: true,
      enumerable: true
    }
  });

  if (content) {
    this.setContent(content);
  }

  // promisifying
  if (kuzzleSecurity.kuzzle.bluebird) {
    return kuzzleSecurity.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['delete'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }
}

/**
 *
 * @param {Object} data - New securityDocument content
 *
 * @return {Object} this
 */
KuzzleSecurityDocument.prototype.setContent = function (data) {
  this.content = data;

  return this;
};

/**
 * Serialize this object into a pojo
 *
 * @return {object} pojo representing this securityDocument
 */
KuzzleSecurityDocument.prototype.serialize = function () {
  var
    data = {};

  if (this.id) {
    data._id = this.id;
  }

  data.body = this.content;

  return data;
};

/**
 * Delete the current KuzzleSecurityDocument into Kuzzle.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 */
KuzzleSecurityDocument.prototype.delete = function (options, cb) {
  var
    self = this;

  if (options && cb === undefined && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(this.kuzzleSecurity.buildQueryArgs(this.deleteActionName), {_id: this.id}, options, function (error, res) {
    if (error) {
      return cb ? cb(error) : false;
    }

    if (cb) {
      cb(null, res.result._id);
    }
  });
};

module.exports = KuzzleSecurityDocument;