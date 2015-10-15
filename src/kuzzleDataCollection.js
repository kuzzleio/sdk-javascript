var
  KuzzleDocument = require('./kuzzleDocument'),
  KuzzleDataMapping = require('./kuzzleDataMapping'),
  KuzzleRoom = require('./kuzzleRoom');

/**
 * This is a global callback pattern, called by all asynchronous functions of the Kuzzle object.
 *
 * @callback responseCallback
 * @param {Object} err - Error object, NULL if the query is successful
 * @param {Object} data - The content of the query response
 */

/**
 * Callback pattern: simple callback called when an async processus is finished
 *
 * @callback readyCallback
 */

/**
 * A data collection is a set of data managed by Kuzzle. It acts like a data table for persistent documents,
 * or like a room for pub/sub messages.
 * @param {object} kuzzle - Kuzzle instance to inherit from
 * @param {string} collection - name of the data collection to handle
 * @param {object} [headers] - default document headers
 * @constructor
 */
function KuzzleDataCollection(kuzzle, collection) {
  Object.defineProperties(this, {
    // read-only properties
    collection: {
      value: collection,
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

  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this);
  }

  return this;
}

/**
 * Executes an advanced search on the data collection.
 *
 * /!\ There is a small delay between documents creation and their existence in our advanced search layer,
 * usually a couple of seconds.
 * That means that a document that was just been created won’t be returned by this function.
 *
 * @param {object} filters - Filters in Elasticsearch Query DSL format
 * @param {responseCallback} cb - Handles the query response
 * @returns {Object} this
 */
KuzzleDataCollection.prototype.advancedSearch = function (filters, cb) {
  var query;

  this.kuzzle.callbackRequired('KuzzleDataCollection.advancedSearch', cb);

  query = this.kuzzle.addHeaders({body: filters}, this.headers);

  this.kuzzle.query(this.collection, 'read', 'search', query, cb);

  return this;
};

/**
 * Returns the number of documents matching the provided set of filters.
 *
 * There is a small delay between documents creation and their existence in our advanced search layer,
 * usually a couple of seconds.
 * That means that a document that was just been created won’t be returned by this function
 *
 * @param {object} filters - Filters in Elasticsearch Query DSL format
 * @param {responseCallback} cb - Handles the query response
 * @returns {Object} this
 */
KuzzleDataCollection.prototype.count = function (filters, cb) {
  var query;

  this.kuzzle.callbackRequired('KuzzleDataCollection.count', cb);

  query = this.kuzzle.addHeaders({body: filters}, this.headers);

  this.kuzzle.query(this.collection, 'read', 'count', query, cb);

  return this;
};

/**
 * Store a document or publish a realtime message.
 *
 * Available options:
 *   - persist (boolean - default: false): Indicates if this is a realtime message or a persistent document
 *   - updateIfExist (boolean - default: false):
 *       If the same document already exists: returns an error if sets to false.
 *       Update the existing document otherwise.
 *
 * @param {object} document - either an instance of a KuzzleDocument object, or a document
 * @param {object} [options] - optional configuration for this document creation
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {Object} this
 */
KuzzleDataCollection.prototype.create = function (document, options, cb) {
  var data = {};

  if (options && options.persist) {
    data.persist = options.persist;
  } else {
    data.persist = false;
  }

  if (document instanceof KuzzleDocument) {
    // TODO: manage KuzzleDocument document argument
  } else {
    data.body = document;
  }

  data = this.kuzzle.addHeaders(data, this.headers);

  if (options && options.updateIfExist) {
    this.kuzzle.query(this.collection, 'write', 'createOrUpdate', data, cb);
  } else {
    this.kuzzle.query(this.collection, 'write', 'create', data, cb);
  }

  return this;
};

/**
 * Delete persistent documents.
 *
 * There is a small delay between documents creation and their existence in our advanced search layer,
 * usually a couple of seconds.
 * That means that a document that was just been created won’t be returned by this function
 *
 * @param {string|object} arg - Either a document ID (will delete only this particular document), or a set of filters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {Object} this
 */
KuzzleDataCollection.prototype.delete = function (arg, cb) {
  var data = {};

  if (typeof arg === 'string') {
    data._id = arg;
  } else {
    data.body = arg;
  }

  data = this.kuzzle.addHeaders(data, this.headers);
  this.kuzzle.query(this.collection, 'write', 'delete', data, cb);

  return this;
};

/**
 * Retrieve a single stored document using its unique document ID.
 *
 * @param {string} documentId - Unique document identifier
 * @param {responseCallback} cb - Handles the query response
 * @returns {Object} this
 */
KuzzleDataCollection.prototype.get = function (documentId, cb) {
  var data = {_id: documentId};

  this.kuzzle.callbackRequired('KuzzleDataCollection.get', cb);
  data = this.kuzzle.addHeaders(data, this.headers);

  this.kuzzle.query(this.collection, 'read', 'get', data, cb);

  return this;
};

KuzzleDataCollection.prototype.fetch = KuzzleDataCollection.prototype.get;

/**
 * Retrieves all documents stored in this data collection
 *
 * @param {responseCallback} cb - Handles the query response
 * @returns {Object} this
 */
KuzzleDataCollection.prototype.getAll = function (cb) {
  this.kuzzle.callbackRequired('KuzzleDataCollection.getAll', cb);

  //TODO: implement getAll method

  return this;
};

KuzzleDataCollection.prototype.fetchAll = KuzzleDataCollection.prototype.getAll;


/**
 * Instantiates a KuzzleDataMapping object containing the current mapping of this collection.
 *
 * @param {responseCallback} cb - Returns an instantiated KuzzleDataMapping object
 * @return {object} this
 */
KuzzleDataCollection.prototype.getMapping = function (cb) {
  var kuzzleMapping;

  this.kuzzle.callbackRequired('KuzzleDataCollection.getMapping', cb);

  // TODO: implement the getMapping method
  kuzzleMapping = new KuzzleDataMapping(this);
  kuzzleMapping.refresh(cb);

  return this;
};

/**
 * Replace an existing document with a new one.
 *
 * @param {string} documentId - Unique document identifier of the document to replace
 * @param {object} content - Either a KuzzleDocument or a JSON object representing the new document version
 * @param {responseCallback} [cb] - Returns an instantiated KuzzleDataMapping object
 * @return {object} this
 */
KuzzleDataCollection.prototype.replace = function (documentId, content, cb) {
  var data = {
    _id: documentId
  };

  if (content instanceof KuzzleDocument) {
    // TODO: handle KuzzleDocument argument
  } else {
    data.body = content;
  }

  data = this.kuzzle.addHeaders(data, this.headers);
  this.kuzzle.query(this.collection, 'write', 'createOrUpdate', data, cb);

  return this;
};

/**
 * Subscribes to this data collection with a set of filters.
 * To subscribe to the entire data collection, simply provide an empty filter.
 *
 * @param {object} filters - Filters in Kuzzle DSL format
 * @param {responseCallback} cb - called for each new notification
 * @param {object} [options] - subscriptions options
 * @param {readyCallback} [ready] - called once the subscription is finished
 * @returns {*} KuzzleRoom object
 */
KuzzleDataCollection.prototype.subscribe = function (filters, cb, options, ready) {
  var room;

  this.kuzzle.isValid();
  this.kuzzle.callbackRequired('KuzzleDataCollection.subscribe', cb);

  room = new KuzzleRoom(this, options);

  return room.renew(filters, cb, ready);
};

/**
 * Update parts of a document
 *
 * @param {string} documentId - Unique document identifier of the document to update
 * @param {object} content - Either a KuzzleDocument or a JSON object representing the new document version
 * @param {responseCallback} [cb] - Returns an instantiated KuzzleDataMapping object
 * @return {object} this
 */
KuzzleDataCollection.prototype.update = function (documentId, content, cb) {
  var data = {
    _id: documentId
  };

  if (content instanceof KuzzleDocument) {
    // TODO: handle KuzzleDocument argument
  } else {
    data.body = content;
  }

  data = this.kuzzle.addHeaders(data, headers);
  this.kuzzle.query(this.collection, 'write', 'update', data, cb);

  return this;
};

module.exports = KuzzleDataCollection;
