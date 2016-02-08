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


module.exports = KuzzleSecurityDocument;