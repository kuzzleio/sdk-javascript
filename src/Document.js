/**
 * This is a global callback pattern, called by all asynchronous functions of the Kuzzle object.
 *
 * @callback responseCallback
 * @param {Object} err - Error object, NULL if the query is successful
 * @param {Object} [data] - The content of the query response
 */

/**
 * Kuzzle handles documents either as realtime messages or as stored documents.
 * Document is the object representation of one of these documents.
 *
 * Notes:
 *   - this constructor may be called either with a documentId, a content, neither or both.
 *   - providing a documentID to the constructor will automatically call refresh, unless a content is also provided
 *
 *
 * @param {Collection} collection - an instanciated Collection object
 * @param {string} [documentId] - ID of an existing document
 * @param {object} [content] - Initializes this document with the provided content
 * @param {object} [meta] - Initializes this document with the provided meta
 * @constructor
 */
function Document(collection, documentId, content, meta) {
  Object.defineProperties(this, {
    // read-only properties
    collection: {
      value: collection.collection,
      enumerable: true
    },
    dataCollection: {
      value: collection,
      enumerable: false
    },
    kuzzle: {
      value: collection.kuzzle,
      enumerable: false
    },
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
    },
    headers: {
      value: JSON.parse(JSON.stringify(collection.headers)),
      enumerable: true,
      writable: true
    },
    version: {
      value: undefined,
      enumerable: true,
      writable: true
    },
    meta: {
      value: meta || {},
      enumerable: true,
      writable: false
    }
  });

  // handling provided arguments
  if (!content && documentId && typeof documentId === 'object') {
    content = documentId;
    documentId = null;
  }

  if (content) {
    if (content._version) {
      this.version = content._version;
      delete content._version;
    }
    this.setContent(content, true);
  }

  if (documentId) {
    Object.defineProperty(this, 'id', {
      value: documentId,
      enumerable: true
    });
  }

  // promisifying
  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['delete', 'refresh', 'save'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

  return this;
}

/**
 * Serialize this object into a JSON object
 *
 * @return {object} JSON object representing this document
 */
Document.prototype.serialize = function () {
  var
    data = {};

  if (this.id) {
    data._id = this.id;
  }

  if (this.version) {
    data._version = this.version;
  }

  data.body = this.content;
  data.meta = this.meta;
  data = this.kuzzle.addHeaders(data, this.headers);

  return data;
};

/**
 * Overrides the toString() method in order to return a serialized version of the document
 *
 * @return {string} serialized version of this object
 */
Document.prototype.toString = function () {
  return JSON.stringify(this.serialize());
};

/**
 * Deletes this document in Kuzzle.
 *
 * Takes an optional argument object with the following properties:
 *    - volatile (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {*} this
 */
Document.prototype.delete = function (options, cb) {
  var self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (!self.id) {
    throw new Error('Document.delete: cannot delete a document without a document ID');
  }

  this.kuzzle.query(this.dataCollection.buildQueryArgs('document', 'delete'), this.serialize(), options, cb && function (err) {
    cb(err, err ? undefined : self.id);
  });
};

/**
 * Checks if this document exists in Kuzzle.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {*} this
 */
Document.prototype.exists = function (options, cb) {
  var self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (!self.id) {
    throw new Error('Document.exists: cannot check if the document exists if no id has been provided');
  }

  this.kuzzle.query(this.dataCollection.buildQueryArgs('document', 'exists'), this.serialize(), options, cb && function (err, res) {
    cb(err, err ? undefined : res.result);
  });
};

/**
 * Replaces the current content with the last version of this document stored in Kuzzle.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {*} this
 */
Document.prototype.refresh = function (options, cb) {
  var self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (!self.id) {
    throw new Error('Document.refresh: cannot retrieve a document if no ID has been provided');
  }

  this.kuzzle.callbackRequired('Document.refresh', cb);

  self.kuzzle.query(self.dataCollection.buildQueryArgs('document', 'get'), {_id: self.id}, options, function (error, res) {
    var newDocument;

    if (error) {
      return cb(error);
    }

    newDocument = new Document(self.dataCollection, self.id, res.result._source, res.result._meta);
    newDocument.version = res.result._version;

    cb(null, newDocument);
  });
};

/**
 * Saves this document into Kuzzle.
 *
 * If this is a new document, this function will create it in Kuzzle and the id property will be made available.
 * Otherwise, this method will replace the latest version of this document in Kuzzle by the current content
 * of this object.
 *
 * Takes an optional argument object with the following properties:
 *    - volatile (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {*} this
 */
Document.prototype.save = function (options, cb) {
  var
    data = this.serialize(),
    self = this;

  if (options && cb === undefined && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(this.dataCollection.buildQueryArgs('document', 'createOrReplace'), data, options, function (error, res) {
    if (error) {
      return cb && cb(error);
    }

    self.id = res.result._id;
    self.version = res.result._version;

    if (cb) {
      cb(null, self);
    }
  });

  return self;
};

/**
 * Sends the content of this document as a realtime message.
 *
 * Takes an optional argument object with the following properties:
 *    - volatile (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {object} [options] - Optional parameters
 * @returns {*} this
 */
Document.prototype.publish = function (options) {
  var data = this.serialize();

  this.kuzzle.query(this.dataCollection.buildQueryArgs('realtime', 'publish'), data, options);

  return this;
};

/**
 * Replaces the current content with new data.
 * Changes made by this function won’t be applied until the save method is called.
 *
 * @param {object} data - New content
 * @param {boolean} replace - if true: replace this document content with the provided data
 */
Document.prototype.setContent = function (data, replace) {
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
 * @param {object} [options] - subscription options
 * @param {responseCallback} cb - callback that will be called each time a change has been detected on this document
 */
Document.prototype.subscribe = function (options, cb) {
  var filters;

  if (options && !cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.callbackRequired('Document.subscribe', cb);

  if (!this.id) {
    throw new Error('Document.subscribe: cannot subscribe to a document if no ID has been provided');
  }

  filters = { ids: { values: [this.id] } };

  return this.dataCollection.subscribe(filters, options, cb);
};

/**
 * Helper function allowing to set headers while chaining calls.
 *
 * If the replace argument is set to true, replace the current headers with the provided content.
 * Otherwise, it appends the content to the current headers, only replacing already existing values
 *
 * @param content - new headers content
 * @param [replace] - default: false = append the content. If true: replace the current headers with tj
 */
Document.prototype.setHeaders = function (content, replace) {
  this.kuzzle.setHeaders.call(this, content, replace);
  return this;
};


module.exports = Document;
