function KuzzleSecurityDocument(kuzzle, id, content) {
  // Define properties
  Object.defineProperties(this, {
    // private properties
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

  Object.defineProperty(this, 'kuzzle', {
    value: kuzzle
  });

  if (content) {
    this.setContent(content);
  }

  if (!id) {
    throw new Error('A security document ' + typeof this + ' must have an id');
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
 * Serialize this object into a JSON object
 *
 * @return {object} JSON object representing this securityDocument
 */
KuzzleSecurityDocument.prototype.toJSON = function () {
  var
    data = {};

  if (this.id) {
    data._id = this.id;
  }

  data.body = this.content;

  return data;
};

module.exports = KuzzleSecurityDocument;