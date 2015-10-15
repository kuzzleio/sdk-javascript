/**
 * This is a global callback pattern, called by all asynchronous functions of the Kuzzle object.
 *
 * @callback responseCallback
 * @param {Object} err - Error object, NULL if the query is successful
 * @param {Object} data - The content of the query response
 */

/**
 * Kuzzle handles documents either as realtime messages or as stored documents.
 * KuzzleDocument is the object representation of one of these documents.
 *
 * @param {object} kuzzleDataCollection - an instanciated KuzzleDataCollection object
 * @constructor
 */
function KuzzleDocument(kuzzleDataCollection) {
  Object.defineProperties(this, {
    // read-only properties
    collection: {
      value: kuzzleDataCollection.collection,
      enumerable: true
    },
    createdTimestamp: {
      value: 'not yet implemented',
      enumerable: true
    },
    kuzzle: {
      value: kuzzleDataCollection.kuzzle,
      enumerable: true
    },
    modifiedTimestamp: {
      value: 'not yet implemented',
      enumerable: true
    },
    // writable properties
    content: {
      value: {},
      enumerable: true,
      writable: true,
      set: function (data) {
        return this.setContent(data);
      }
    },
    headers: {
      value: JSON.parse(JSON.stringify(kuzzleDataCollection.headers)),
      enumerable: true,
      writable: true
    }
  });

  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this);
  }

  return this;
}

/**
 * Serialize this object into a JSON object
 *
 * @return {object} JSON object representing this document
 */
KuzzleDocument.prototype.toJSON = function () {
  var
    data = {};

  if (this.id) {
    data._id = this.id;
  }

  data.body = this.content;
  data = this.kuzzle.addHeaders(data, this.headers);

  return data;
};

/**
 * Deletes this document in Kuzzle.
 *
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {*} this
 */
KuzzleDocument.prototype.delete = function (cb) {
  if (!this.id) {
    return this;
  }

  this.kuzzle.query(this.collection, 'write', 'delete', this.toJSON(), cb);

  return this;
};

/**
 * Replaces the current content with the last version of this document stored in Kuzzle.
 *
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {*} this
 */
KuzzleDocument.prototype.refresh = function (cb) {
  var self = this;

  if (!self.id) {
    return self;
  }

  self.kuzzle.query(self.collection, 'read', 'get', {_id: self.id}, function (error, result) {
    if (error) {
      return cb ? cb(error) : false;
    }

    self.content = result._source;
    cb(null, result);
  });

  return this;
};

/**
 * Saves this document into Kuzzle.
 * If this is a new document, this function will create it in Kuzzle. Otherwise, you can specify whether you want
 * to merge this document with the one stored in Kuzzle, or if you want to replace it.
 *
 * @param {boolean} replace - true: replace the document, false: merge it
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {*} this
 */
KuzzleDocument.prototype.save = function (replace, cb) {
  var
    data = this.toJSON(),
    self = this;
  var queryCB = function (error, result) {
    if (error) {
      return cb ? cb(error) : false;
    }

    if (!self.id) {
      Object.defineProperty(self, 'id', {
        value: result._id,
        enumerable: true
      });
    }

    if (cb) {
      cb(null, result);
    }
  };

  data.persist = true;

  if (!self.id || replace) {
    self.kuzzle.query(this.collection, 'write', 'createOrUpdate', data, queryCB);
  } else {
    self.kuzzle.query(this.collection, 'write', 'update', data, queryCB);
  }

  return self;
};

/**
 * Sends the content of this document as a realtime message.
 *
 * @returns {*} this
 */
KuzzleDocument.prototype.send = function () {
  var data = this.toJSON();

  data.persist = false;

  this.kuzzle.query(this.collection, 'write', 'create', data);

  return this;
};

/**
 * Replaces the current content with new data.
 * Changes made by this function won’t be applied until the save method is called.
 *
 * @param {object} data - New content
 * @param {boolean} replace - if true: replace this document content with the provided data
 */
KuzzleDocument.prototype.setContent = function (data, replace) {
  var self = this;

  if (replace) {
    this.content = data;
  }
  else {
    Object.keys(data).forEach(function (key) {
      self.content[key] = data[key];
    });
  }

  return this;
};

/**
 * Listens to events concerning this document. Has no effect if the document does not have an ID
 * (i.e. if the document has not yet been created as a persisted document).
 *
 * @param {responseCallback} cb - callback that will be called each time a change has been detected on this document
 */
KuzzleDocument.prototype.subscribe = function (cb) {
  this.kuzzle.callbackRequired('KuzzleDocument.subscribe', cb);

  if (!this.id) {
    cb(new Error('Cannot subscribe to a document that has not been created into Kuzzle'));
  }

  // TODO: implement this function once KuzzleRoom has been implemented
  return null;
};

module.exports = KuzzleDocument;
