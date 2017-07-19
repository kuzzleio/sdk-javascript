function SecurityDocument(Security, id, content, meta) {

  if (!id) {
    throw new Error('A security document must have an id');
  }

  // Define properties
  Object.defineProperties(this, {
    // private properties
    kuzzle: {
      value: Security.kuzzle
    },
    Security: {
      value: Security
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
    },
    meta: {
      value: meta || {},
      writable: true,
      enumerable: true
    }
  });

  if (content) {
    this.setContent(content, true);
  }

  // promisifying
  if (Security.kuzzle.bluebird) {
    return Security.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['delete', 'update'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }
}

/**
 * Replaces the current content with new data.
 * Changes made by this function won’t be applied until the save method is called.
 *
 * @param {Object} data - New securityDocument content
 * @return {SecurityDocument} this
 */
SecurityDocument.prototype.setContent = function (data) {
  this.content = data;
  return this;
};

/**
 * Serialize this object into a pojo
 *
 * @return {object} pojo representing this securityDocument
 */
SecurityDocument.prototype.serialize = function () {
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
 * Delete the current KuzzleSecurityDocument into Kuzzle.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 */
SecurityDocument.prototype.delete = function (options, cb) {
  var
    self = this;

  if (options && cb === undefined && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(this.Security.buildQueryArgs(this.deleteActionName), {_id: this.id}, options, function (error, res) {
    if (error) {
      return cb ? cb(error) : false;
    }

    if (cb) {
      cb(null, res.result._id);
    }
  });
};

/**
 * Update the current KuzzleSecurityDocument into Kuzzle.
 *
 * @param {object} content - Content to add to KuzzleSecurityDocument
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {SecurityDocument} this
 */
SecurityDocument.prototype.update = function (content, options, cb) {
  var
    data = {},
    self = this;

  if (typeof content !== 'object') {
    throw new Error('Parameter "content" must be a object');
  }

  if (options && cb === undefined && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data._id = self.id;
  data.body = content;

  self.kuzzle.query(this.Security.buildQueryArgs(this.updateActionName), data, options, function (error, response) {
    if (error) {
      return cb ? cb(error) : false;
    }

    self.setContent(response.result._source);

    if (cb) {
      cb(null, self);
    }
  });

  return this;
};

module.exports = SecurityDocument;
