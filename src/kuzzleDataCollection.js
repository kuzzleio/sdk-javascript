var
  KuzzleSearchResult = require('./kuzzleSearchResult'),
  KuzzleDocument = require('./kuzzleDocument'),
  KuzzleDataMapping = require('./kuzzleDataMapping'),
  KuzzleRoom = require('./kuzzleRoom'),
  KuzzleSubscribeResult = require('./kuzzleSubscribeResult');

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
function KuzzleDataCollection(kuzzle, collection, index) {
  if (!index || !collection) {
    throw new Error('The KuzzleDataCollection object constructor needs an index and a collection arguments');
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
KuzzleDataCollection.prototype.count = function (filters, options, cb) {
  var
    query;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.callbackRequired('KuzzleDataCollection.count', cb);

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
KuzzleDataCollection.prototype.create = function (options, cb) {
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
 *    - metadata (object, default: null):
 *        Additional information passed to notifications to other users
 *    - updateIfExist (boolean, default: false):
 *        If the same document already exists: throw an error if sets to false.
 *        Update the existing document otherwise
 *
 * @param {string} [id] - (optional) document identifier
 * @param {object} document - either an instance of a KuzzleDocument object, or a document
 * @param {object} [options] - optional arguments
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {Object} this
 */
KuzzleDataCollection.prototype.createDocument = function (id, document, options, cb) {
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

  if (document instanceof KuzzleDocument) {
    data = document.serialize();
  } else {
    data.body = document;
  }

  if (options) {
    action = options.updateIfExist ? 'createOrReplace' : 'create';
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

    doc = new KuzzleDocument(self, res.result._id, res.result._source);
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
 *    - metadata (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {string|object} arg - Either a document ID (will delete only this particular document), or a set of filters
 * @param {object} [options] - optional arguments
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {KuzzleDataCollection} this
 */
KuzzleDataCollection.prototype.deleteDocument = function (arg, options, cb) {
  var
    action,
    data = {};

  if (typeof arg === 'string') {
    data._id = arg;
    action = 'delete';
  } else {
    data.body = arg;
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
 * Retrieve a single stored document using its unique document ID.
 *
 * @param {string} documentId - Unique document identifier
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 */
KuzzleDataCollection.prototype.fetchDocument = function (documentId, options, cb) {
  var
    data = {_id: documentId},
    self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.callbackRequired('KuzzleDataCollection.fetch', cb);
  data = self.kuzzle.addHeaders(data, this.headers);

  self.kuzzle.query(this.buildQueryArgs('document', 'get'), data, options, function (err, res) {
    var document;

    if (err) {
      return cb(err);
    }

    document = new KuzzleDocument(self, res.result._id, res.result._source);
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
KuzzleDataCollection.prototype.fetchAllDocuments = function (options, cb) {
  var
    warnEmitted = false,
    documents = [],
    filters = {};

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
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

  this.kuzzle.callbackRequired('KuzzleDataCollection.fetchAllDocuments', cb);

  this.search(filters, options, function getNextDocuments (error, searchResult) {
    if (error) {
      return cb(error);
    }

    if (searchResult instanceof KuzzleSearchResult) {
      if (searchResult.total > 10000 && !warnEmitted) {
        warnEmitted = true;
        console.warn('Usage of KuzzleDataCollection.fetchAllDocuments will fetch more than 10 000 document. To avoid performance issues, please use KuzzleDataCollection.search and KuzzleDataCollection.scroll requests'); // eslint-disable-line no-console
      }

      searchResult.documents.forEach(document => {
        documents.push(document);
      });
      searchResult.next(getNextDocuments);
    }
    else {
      cb(null, documents);
    }
  });
};


/**
 * Instantiates a KuzzleDataMapping object containing the current mapping of this collection.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Returns an instantiated KuzzleDataMapping object
 */
KuzzleDataCollection.prototype.getMapping = function (options, cb) {
  var kuzzleMapping;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.callbackRequired('KuzzleDataCollection.getMapping', cb);

  kuzzleMapping = new KuzzleDataMapping(this);
  kuzzleMapping.refresh(options, cb);
};

/**
 * Publish a realtime message
 *
 * Takes an optional argument object with the following properties:
 *    - metadata (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {object} document - either a KuzzleDocument instance or a JSON object
 * @param {object} [options] - optional arguments
 * @param {responseCallback} [cb] - Returns a raw Kuzzle response
 * @returns {*} this
 */
KuzzleDataCollection.prototype.publishMessage = function (document, options, cb) {
  var data = {};

  if (document instanceof KuzzleDocument) {
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
 *    - metadata (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {string} documentId - Unique document identifier of the document to replace
 * @param {object} content - JSON object representing the new document version
 * @param {object} [options] - additional arguments
 * @param {responseCallback} [cb] - Returns an instantiated KuzzleDocument object
 * @return {object} this
 */
KuzzleDataCollection.prototype.replaceDocument = function (documentId, content, options, cb) {
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

    document = new KuzzleDocument(self, res.result._id, res.result._source);
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

KuzzleDataCollection.prototype.search = function (filters, options, cb) {
  var
    query,
    self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = {};
  }

  self.kuzzle.callbackRequired('KuzzleDataCollection.search', cb);

  query = self.kuzzle.addHeaders({body: filters}, this.headers);


  self.kuzzle.query(this.buildQueryArgs('document', 'search'), query, options, function (error, result) {
    var documents = [];

    if (error) {
      return cb(error);
    }

    result.result.hits.forEach(function (doc) {
      var newDocument = new KuzzleDocument(self, doc._id, doc._source);

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
      result.result.aggregations ? result.result.aggregations : [],
      {options: options, filters: filters}
    ));
  });
};

/**
 * Scroll into a search result
 *
 * @param {string} scrollId
 * @param {object} [options]
 * @param {object} [filters]
 * @param {responseCallback} cb
 */
KuzzleDataCollection.prototype.scroll = function (scrollId, options, filters, cb) {
  var
    request = {body: {}},
    self = this;

  if (!scrollId) {
    throw new Error('KuzzleDataCollection.scroll: scrollId required');
  }

  if (!cb) {
    cb = filters;
    filters = null;
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (!options) {
    options = {};
  }

  options.scrollId = scrollId;

  this.kuzzle.callbackRequired('KuzzleDataCollection.scroll', cb);

  this.kuzzle.query({controller: 'document', action: 'scroll'}, request, options, function (error, result) {
    var documents = [];

    if (error) {
      return cb(error);
    }

    result.result.hits.forEach(function (doc) {
      var newDocument = new KuzzleDocument(self, doc._id, doc._source);

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
      result.result.aggregations ? result.result.aggregations : [],
      {options: options, filters: filters}
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
KuzzleDataCollection.prototype.subscribe = function (filters, options, cb) {
  var
    room,
    subscribeResult;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.callbackRequired('KuzzleDataCollection.subscribe', cb);

  subscribeResult = new KuzzleSubscribeResult();
  room = new KuzzleRoom(this, options);

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
KuzzleDataCollection.prototype.truncate = function (options, cb) {
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
 *    - metadata (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {string} documentId - Unique document identifier of the document to update
 * @param {object} content - JSON object containing changes to perform on the document
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Returns an instantiated KuzzleDocument object
 * @return {object} this
 */
KuzzleDataCollection.prototype.updateDocument = function (documentId, content, options, cb) {
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

  data = self.kuzzle.addHeaders(data, this.headers);

  self.kuzzle.query(this.buildQueryArgs('document', 'update'), data, options, cb && function (err, res) {
    if (err) {
      return cb(err);
    }

    (new KuzzleDocument(self, res.result._id)).refresh(cb);
  });

  return self;
};


/**
 * Instantiate a new KuzzleDocument object. Workaround to the module.exports limitation, preventing multiple
 * constructors to be exposed without having to use a factory or a composed object.
 *
 * @param {string} id - document id
 * @param {object} content - document content
 * @constructor
 */
KuzzleDataCollection.prototype.documentFactory = function (id, content) {
  return new KuzzleDocument(this, id, content);
};

/**
 * Instantiate a new KuzzleRoom object. Workaround to the module.exports limitation, preventing multiple
 * constructors to be exposed without having to use a factory or a composed object.
 *
 * @param {object} [options] - subscription configuration
 * @constructor
 */
KuzzleDataCollection.prototype.roomFactory = function (options) {
  return new KuzzleRoom(this, options);
};

/**
 * Instantiate a new KuzzleDataMapping object. Workaround to the module.exports limitation, preventing multiple
 * constructors to be exposed without having to use a factory or a composed object.
 *
 * @param {object} [mapping] - mapping to instantiate the KuzzleDataMapping object with
 * @constructor
 */
KuzzleDataCollection.prototype.dataMappingFactory = function (mapping) {
  return new KuzzleDataMapping(this, mapping);
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
KuzzleDataCollection.prototype.setHeaders = function (content, replace) {
  this.kuzzle.setHeaders.call(this, content, replace);
  return this;
};

module.exports = KuzzleDataCollection;
