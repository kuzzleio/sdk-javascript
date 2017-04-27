var
  KuzzleSearchResult = require('./SearchResult'),
  Document = require('./Document'),
  CollectionMapping = require('./CollectionMapping'),
  Room = require('./Room'),
  SubscribeResult = require('./SubscribeResult');

/**
 * This is a global callback pattern, called by all asynchronous functions of the Kuzzle object.
 *
 * @callback responseCallback
 * @param {Object} err - Error object, NULL if the query is successful
 * @param {Object} [data] - The content of the query response
 */

/**
 * A data collection is a set of data managed by Kuzzle. It acts like a data table for persistent documents,
 * or like a room for pub/sub messages.
 *
 * @property {string} collection
 * @property {string} index
 * @property {Kuzzle} kuzzle
 * @property {Array.<string>} collection
 * @param {object} kuzzle - Kuzzle instance to inherit from
 * @param {string} collection - name of the data collection to handle
 * @param {string} index - Index containing the data collection
 * @constructor
 */
function Collection(kuzzle, collection, index) {
  if (!index || !collection) {
    throw new Error('The Collection object constructor needs an index and a collection arguments');
  }

  Object.defineProperties(this, {
    // read-only properties
    collection: {
      value: collection,
      enumerable: true
    },
    index: {
      value: index,
      enumerable: true
    },
    kuzzle: {
      value: kuzzle,
      enumerable: true
    },
    // writable properties
    headers: {
      value: JSON.parse(JSON.stringify(kuzzle.headers)),
      enumerable: true,
      writable: true
    }
  });

  Object.defineProperty(this, 'buildQueryArgs', {
    value: function (controller, action) {
      return {
        controller: controller,
        action: action,
        collection: this.collection,
        index: this.index
      };
    }
  });

  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var blacklist = ['publishMessage', 'setHeaders', 'subscribe'];

        return passes && blacklist.indexOf(name) === -1;
      }
    });
  }

  return this;
}

/**
 * Returns the number of documents matching the provided set of filters.
 *
 * There is a small delay between documents creation and their existence in our advanced search layer,
 * usually a couple of seconds.
 * That means that a document that was just been created won’t be returned by this function
 *
 * @param {object} filters - Filters in Elasticsearch Query DSL format
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 */
Collection.prototype.count = function (filters, options, cb) {
  var
    query;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.callbackRequired('Collection.count', cb);

  query = this.kuzzle.addHeaders({body: filters}, this.headers);

  this.kuzzle.query(this.buildQueryArgs('document', 'count'), query, options, function (error, result) {
    cb(error, result && result.result.count);
  });
};

/**
 * Create a new empty data collection, with no associated mapping.
 * Kuzzle automatically creates data collections when storing documents, but there are cases where we
 * want to create and prepare data collections before storing documents in it.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - returns Kuzzle's response
 * @returns {*} this
 */
Collection.prototype.create = function (options, cb) {
  var data = {};

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data = this.kuzzle.addHeaders(data, this.headers);
  this.kuzzle.query(this.buildQueryArgs('collection', 'create'), data, options, cb);

  return this;
};

/**
 * Create a new document in Kuzzle.
 *
 * Takes an optional argument object with the following properties:
 *    - volatile (object, default: null):
 *        Additional information passed to notifications to other users
 *    - ifExist (string, allowed values: "error" (default), "replace"):
 *        If the same document already exists:
 *          - resolves with an error if set to "error".
 *          - replaces the existing document if set to "replace"
 *
 * @param {string} [id] - (optional) document identifier
 * @param {object} document - either an instance of a Document object, or a document
 * @param {object} [options] - optional arguments
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {Object} this
 */
Collection.prototype.createDocument = function (id, document, options, cb) {
  var
    self = this,
    data = {},
    action = 'create';

  if (id && typeof id !== 'string') {
    cb = options;
    options = document;
    document = id;
    id = null;
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (document instanceof Document) {
    data = document.serialize();
  } else {
    data.body = document;
  }

  if (options && options.ifExist) {
    if (options.ifExist === 'replace') {
      action = 'createOrReplace';
    }
    else if (options.ifExist !== 'error') {
      throw new Error('Invalid value for the "ifExist" option: ' + options.ifExist);
    }
  }

  if (id) {
    data._id = id;
  }

  data = self.kuzzle.addHeaders(data, self.headers);

  self.kuzzle.query(this.buildQueryArgs('document', action), data, options, cb && function (err, res) {
    var doc;

    if (err) {
      return cb(err);
    }

    doc = new Document(self, res.result._id, res.result._source);
    doc.version = res.result._version;
    cb(null, doc);
  });

  return this;
};

/**
 * Delete persistent documents.
 *
 * There is a small delay between documents creation and their existence in our advanced search layer,
 * usually a couple of seconds.
 * That means that a document that was just been created won’t be returned by this function
 *
 * Takes an optional argument object with the following properties:
 *    - volatile (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {string|object} arg - Either a document ID (will delete only this particular document), or a set of filters
 * @param {object} [options] - optional arguments
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {Collection} this
 */
Collection.prototype.deleteDocument = function (arg, options, cb) {
  var
    action,
    data = {};

  if (typeof arg === 'string') {
    data._id = arg;
    action = 'delete';
  } else {
    data.body = {query: arg};
    action = 'deleteByQuery';
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data = this.kuzzle.addHeaders(data, this.headers);

  this.kuzzle.query(this.buildQueryArgs('document', action), data, options, cb && function (err, res) {
    if (err) {
      cb(err);
    }
    else {
      cb(null, (action === 'delete' ? [res.result._id] : res.result.ids));
    }
  });

  return this;
};

/**
 * Returns a boolean indicating whether or not a document with provided ID exists.
 *
 * @param {string} documentId - Unique document identifier
 * @param {object} options [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 */
Collection.prototype.documentExists = function (documentId, options, cb) {
  var
    data = {_id: documentId},
    self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(this.buildQueryArgs('document', 'exists'), data, options, function (err, res) {
    cb(err, err ? undefined : res.result);
  });
};

/**
 * Retrieve a single stored document using its unique document ID.
 *
 * @param {string} documentId - Unique document identifier
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 */
Collection.prototype.fetchDocument = function (documentId, options, cb) {
  var
    data = {_id: documentId},
    self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.callbackRequired('Collection.fetch', cb);
  data = self.kuzzle.addHeaders(data, this.headers);

  self.kuzzle.query(this.buildQueryArgs('document', 'get'), data, options, function (err, res) {
    var document;

    if (err) {
      return cb(err);
    }

    document = new Document(self, res.result._id, res.result._source);
    document.version = res.result._version;
    cb(null, document);
  });
};

/**
 * Retrieves all documents stored in this data collection
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 */
Collection.prototype.fetchAllDocuments = function (options, cb) {
  var
    warnEmitted = false,
    documents = [],
    filters = {};

  if (!cb && typeof options === 'function') {
    cb = options;
    options = {};
  }

  // copying pagination options to the search filter
  if (!options) {
    options = {};
  }

  if (!options.from) {
    options.from = 0;
  }

  if (!options.size) {
    options.size = 1000;
  }

  this.kuzzle.callbackRequired('Collection.fetchAllDocuments', cb);

  this.search(filters, options, function fetchNextDocuments (error, searchResult) {
    if (error) {
      return cb(error);
    }

    if (searchResult instanceof KuzzleSearchResult) {
      if (searchResult.total > 10000 && !warnEmitted) {
        warnEmitted = true;
        console.warn('Collection.fetchAllDocuments may return extremely large amounts of documents, which may cause performance issues. Unless you know what you are doing, consider using Collection.search or Collection.scroll instead'); // eslint-disable-line no-console
      }

      searchResult.documents.forEach(function(document) {
        documents.push(document);
      });
      searchResult.fetchNext(fetchNextDocuments);
    }
    else {
      cb(null, documents);
    }
  });
};


/**
 * Instantiates a CollectionMapping object containing the current mapping of this collection.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Returns an instantiated CollectionMapping object
 */
Collection.prototype.getMapping = function (options, cb) {
  var kuzzleMapping;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.callbackRequired('Collection.getMapping', cb);

  kuzzleMapping = new CollectionMapping(this);
  kuzzleMapping.refresh(options, cb);
};

/**
 * Publish a realtime message
 *
 * Takes an optional argument object with the following properties:
 *    - volatile (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {object} document - either a Document instance or a JSON object
 * @param {object} [options] - optional arguments
 * @param {responseCallback} [cb] - Returns a raw Kuzzle response
 * @returns {*} this
 */
Collection.prototype.publishMessage = function (document, options, cb) {
  var data = {};

  if (document instanceof Document) {
    data = document.serialize();
  } else {
    data.body = document;
  }

  data = this.kuzzle.addHeaders(data, this.headers);
  this.kuzzle.query(this.buildQueryArgs('realtime', 'publish'), data, options, cb);

  return this;
};

/**
 * Replace an existing document with a new one.
 *
 * Takes an optional argument object with the following properties:
 *    - volatile (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {string} documentId - Unique document identifier of the document to replace
 * @param {object} content - JSON object representing the new document version
 * @param {object} [options] - additional arguments
 * @param {responseCallback} [cb] - Returns an instantiated Document object
 * @return {object} this
 */
Collection.prototype.replaceDocument = function (documentId, content, options, cb) {
  var
    self = this,
    data = {
      _id: documentId,
      body: content
    };

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data = self.kuzzle.addHeaders(data, this.headers);

  self.kuzzle.query(this.buildQueryArgs('document', 'createOrReplace'), data, options, cb && function (err, res) {
    var document;

    if (err) {
      return cb(err);
    }

    document = new Document(self, res.result._id, res.result._source);
    document.version = res.result._version;
    cb(null, document);
  });

  return this;
};

/**
 * Executes an advanced search on the data collection.
 *
 * /!\ There is a small delay between documents creation and their existence in our advanced search layer,
 * usually a couple of seconds.
 * That means that a document that was just been created won’t be returned by this function.
 *
 * @param {object} filters - Filters in Elasticsearch Query DSL format
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 */

Collection.prototype.search = function (filters, options, cb) {
  var
    query,
    self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = {};
  }

  self.kuzzle.callbackRequired('Collection.search', cb);

  query = self.kuzzle.addHeaders({body: filters}, this.headers);


  self.kuzzle.query(this.buildQueryArgs('document', 'search'), query, options, function (error, result) {
    var documents = [];

    if (error) {
      return cb(error);
    }

    result.result.hits.forEach(function (doc) {
      var newDocument = new Document(self, doc._id, doc._source);

      newDocument.version = doc._version;

      documents.push(newDocument);
    });

    if (result.result._scroll_id) {
      options.scrollId = result.result._scroll_id;
    }

    cb(null, new KuzzleSearchResult(
      self,
      result.result.total,
      documents,
      result.result.aggregations ? result.result.aggregations : {},
      options,
      filters,
      options.previous || null
    ));
  });
};

/**
 * A "scroll" option can be passed to search queries, creating persistent
 * paginated results.
 * This method can be used to manually get the next page of a search result,
 * instead of using KuzzleSearchResult.next()
 *
 * @param {string} scrollId
 * @param {object} [options]
 * @param {object} [filters]
 * @param {responseCallback} cb
 */
Collection.prototype.scroll = function (scrollId, options, filters, cb) {
  var
    request = {},
    self = this;

  if (!scrollId) {
    throw new Error('Collection.scroll: scrollId is required');
  }

  if (!cb) {
    cb = filters;
    filters = null;
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = {};
  }

  this.kuzzle.callbackRequired('Collection.scroll', cb);

  request.scrollId = scrollId;

  if (options && options.scroll) {
    request.scroll = options.scroll;
  }

  this.kuzzle.query({controller: 'document', action: 'scroll'}, request, options, function (error, result) {
    var documents = [];

    if (error) {
      return cb(error);
    }

    result.result.hits.forEach(function (doc) {
      var newDocument = new Document(self, doc._id, doc._source);

      newDocument.version = doc._version;

      documents.push(newDocument);
    });

    if (result.result._scroll_id) {
      options.scrollId = result.result._scroll_id;
    }

    cb(null, new KuzzleSearchResult(
      self,
      result.result.total,
      documents,
      {},
      options,
      filters,
      options.previous || null
    ));
  });

  return this;
};

/**
 * Subscribes to this data collection with a set of filters.
 * To subscribe to the entire data collection, simply provide an empty filter.
 *
 * @param {object} filters - Filters in Kuzzle DSL format
 * @param {object} [options] - subscriptions options
 * @param {responseCallback} cb - called for each new notification
 * @returns {*} KuzzleSubscribeResult object
 */
Collection.prototype.subscribe = function (filters, options, cb) {
  var
    room,
    subscribeResult;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.callbackRequired('Collection.subscribe', cb);

  subscribeResult = new SubscribeResult();
  room = new Room(this, options);

  room.renew(filters, cb, subscribeResult.done.bind(subscribeResult));

  return subscribeResult;
};

/**
 * Truncate the data collection, removing all stored documents but keeping all associated mappings.
 * This method is a lot faster than removing all documents using a query.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - returns Kuzzle's response
 * @returns {*} this
 */
Collection.prototype.truncate = function (options, cb) {
  var data = {};

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data = this.kuzzle.addHeaders(data, this.headers);
  this.kuzzle.query(this.buildQueryArgs('collection', 'truncate'), data, options, cb);

  return this;
};


/**
 * Update parts of a document
 *
 * Takes an optional argument object with the following properties:
 *    - volatile (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {string} documentId - Unique document identifier of the document to update
 * @param {object} content - JSON object containing changes to perform on the document
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Returns an instantiated Document object
 * @return {object} this
 */
Collection.prototype.updateDocument = function (documentId, content, options, cb) {
  var
    data = {
      _id: documentId,
      body: content
    },
    self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (options && options.retryOnConflict) {
    data.retryOnConflict = options.retryOnConflict;
  }

  data = self.kuzzle.addHeaders(data, this.headers);

  self.kuzzle.query(this.buildQueryArgs('document', 'update'), data, options, cb && function (err, res) {
    if (err) {
      return cb(err);
    }

    (new Document(self, res.result._id)).refresh(cb);
  });

  return self;
};


/**
 * Instantiate a new Document object. Workaround to the module.exports limitation, preventing multiple
 * constructors to be exposed without having to use a factory or a composed object.
 *
 * @param {string} id - document id
 * @param {object} content - document content
 * @constructor
 */
Collection.prototype.document = function (id, content) {
  return new Document(this, id, content);
};

/**
 * Instantiate a new Room object. Workaround to the module.exports limitation, preventing multiple
 * constructors to be exposed without having to use a factory or a composed object.
 *
 * @param {object} [options] - subscription configuration
 * @constructor
 */
Collection.prototype.room = function (options) {
  return new Room(this, options);
};

/**
 * Instantiate a new CollectionMapping object. Workaround to the module.exports limitation, preventing multiple
 * constructors to be exposed without having to use a factory or a composed object.
 *
 * @param {object} [mapping] - mapping to instantiate the CollectionMapping object with
 * @constructor
 */
Collection.prototype.collectionMapping = function (mapping) {
  return new CollectionMapping(this, mapping);
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
Collection.prototype.setHeaders = function (content, replace) {
  this.kuzzle.setHeaders.call(this, content, replace);
  return this;
};

module.exports = Collection;
