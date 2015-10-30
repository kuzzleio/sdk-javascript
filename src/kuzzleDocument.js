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
 * Notes:
 *   - this constructor may be called either with a documentId, a content, neither or both.
 *   - providing a documentID to the constructor will automatically call refresh, unless a content is also provided
 *
 *
 * @param {object} kuzzleDataCollection - an instanciated KuzzleDataCollection object
 * @param {string} [documentId] - ID of an existing document
 * @param {object} [content] - Initializes this document with the provided content
 * @constructor
 */
function KuzzleDocument(kuzzleDataCollection, documentId, content) {
  Object.defineProperties(this, {
    // private properties
    queue: {
      value: [],
      writable: true
    },
    refreshing: {
      value: false,
      writable: true
    },

    // read-only properties
    collection: {
      value: kuzzleDataCollection.collection,
      enumerable: true
    },
    createdTimestamp: {
      value: 'not yet implemented',
      enumerable: true
    },
    dataCollection: {
      value: kuzzleDataCollection,
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
      enumerable: true,
      set: function (data) {
        if (!content) {
          content = {};
        }

        return this.setContent(data, false);
      },
      get: function () {
        return content;
      }
    },
    headers: {
      value: JSON.parse(JSON.stringify(kuzzleDataCollection.headers)),
      enumerable: true,
      writable: true
    }
  });

  // handling provided arguments
  if (!content && documentId && typeof documentId === 'object') {
    content = documentId;
    documentId = null;
  }

  if (content) {
    this.setContent(content, true);
  }

  if (documentId) {
    Object.defineProperty(this, 'id', {
      value: documentId,
      enumerable: true
    });

    this.refresh();
  }

  // promisifying
  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this, {suffix: 'Promise'});
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
 * Overrides the toString() method in order to return a serialized version of the document
 *
 * @return {string} serialized version of this object
 */
KuzzleDocument.prototype.toString = function () {
  return JSON.stringify(this.toJSON());
};

/**
 * Deletes this document in Kuzzle.
 *
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {*} this
 */
KuzzleDocument.prototype.delete = function (cb) {
  var self = this;

  if (this.refreshing) {
    this.queue.push({action: 'delete', args: [cb]});
    return this;
  }

  if (!this.id) {
    throw new Error('KuzzleDocument.delete: cannot delete a document that has not been saved into Kuzzle');
  }

  if (cb) {
    this.kuzzle.query(this.collection, 'write', 'delete', this.toJSON(), function (err) {
      if (err) {
        return cb(err);
      }

      cb(null, self);
    });
  } else {
    this.kuzzle.query(this.collection, 'write', 'delete', this.toJSON());
  }

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

  if (this.refreshing) {
    this.queue.push({action: 'refresh', args: [cb]});
    return this;
  }

  if (!self.id) {
    throw new Error('KuzzleDocument.refresh: cannot retrieve a document if no ID has been provided');
  }

  self.refreshing = true;

  self.kuzzle.query(self.collection, 'read', 'get', {_id: self.id}, function (error, result) {
    self.refreshing = false;
    dequeue.call(self);

    if (error) {
      return cb ? cb(error) : false;
    }

    self.content = result._source;

    if (cb) {
      cb(null, self);
    }
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
  var queryCB;

  if (!cb && replace && typeof replace === 'function') {
    cb = replace;
    replace = false;
  }

  queryCB = function (error, result) {
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
      cb(null, self);
    }
  };

  if (this.refreshing) {
    this.queue.push({action: 'save', args: [replace, cb]});
    return this;
  }

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
KuzzleDocument.prototype.publish = function () {
  var data = this.toJSON();

  if (this.refreshing) {
    this.queue.push({action: 'publish', args: []});
    return this;
  }

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

  if (this.refreshing) {
    this.queue.push({action: 'setContent', args: [data, replace]});
    return this;
  }

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
  var filters;

  this.kuzzle.callbackRequired('KuzzleDocument.subscribe', cb);

  if (this.refreshing) {
    this.queue.push({action: 'subscribe', args: [cb]});
    return this;
  }

  if (!this.id) {
    throw new Error('KuzzleDocument.subscribe: cannot subscribe to a document if no ID has been provided');
  }

  filters = { term: { _id: this.id } };

  return this.dataCollection.subscribe(filters, cb);
};

function dequeue() {
  var element;

  while (this.queue.length > 0) {
    element = this.queue.shift();
    this[element.action].apply(this, element.args);
  }
}

module.exports = KuzzleDocument;
