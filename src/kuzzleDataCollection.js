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
 * A data collection is a set of data managed by Kuzzle. It acts like a data table for persistent documents,
 * or like a room for pub/sub messages.
 * @param {object} kuzzle - Kuzzle instance to inherit from
 * @param {string} collection - name of the data collection to handle
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
    return this.kuzzle.bluebird.promisifyAll(this, {suffix: 'Promise'});
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
  var
    query,
    self = this;

  self.kuzzle.callbackRequired('KuzzleDataCollection.advancedSearch', cb);

  query = self.kuzzle.addHeaders({body: filters}, this.headers);

  self.kuzzle.query(this.collection, 'read', 'search', query, function (error, result) {
    var documents = [];

    if (error) {
      return cb(error);
    }

    result.hits.hits.forEach(function (doc) {
      documents.push(new KuzzleDocument(self, doc._id, doc._source));
    });

    cb(null, { total: result.hits.total, documents: documents });
  });

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

  this.kuzzle.query(this.collection, 'read', 'count', query, function (error, result) {
    if (error) {
      return cb(error);
    }

    cb(null, result.count);
  });

  return this;
};

/**
 * Create a new document in Kuzzle.
 *
 * By default, the updateIfExist argument is set to false
 *
 * @param {object} document - either an instance of a KuzzleDocument object, or a document
 * @param {boolean} [updateIfExist] - (true)throw an error if document already exists (false)updates the existing document
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {Object} this
 */
KuzzleDataCollection.prototype.create = function (document, updateIfExist, cb) {
  var
    self = this,
    data = {},
    action;

  if (!cb && updateIfExist) {
    if (typeof updateIfExist === 'function') {
      cb = updateIfExist;
      updateIfExist = false;
    }
  }

  if (document instanceof KuzzleDocument) {
    data = document.toJSON();
  } else {
    data.body = document;
  }

  data.persist = true;
  data = self.kuzzle.addHeaders(data, self.headers);
  action = updateIfExist ? 'createOrUpdate' : 'create';

  if (cb) {
    self.kuzzle.query(this.collection, 'write', action, data, function (err, res) {
      if (err) {
        return cb(err);
      }

      cb(null, new KuzzleDocument(self, res._id, res._source));
    });
  } else {
    this.kuzzle.query(this.collection, 'write', action, data);
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

  data = this.kuzzle.addHeaders(data, this.headers);

  if (cb) {
    this.kuzzle.query(this.collection, 'write', action, data, function (err, res) {
      if (err) {
        return cb(err);
      }

      if (action === 'delete') {
        cb(null, [data._id]);
      } else {
        cb(null, res.ids);
      }
    });
  } else {
    this.kuzzle.query(this.collection, 'write', action, data);
  }

  return this;
};

/**
 * Retrieve a single stored document using its unique document ID.
 *
 * @param {string} documentId - Unique document identifier
 * @param {responseCallback} cb - Handles the query response
 * @returns {Object} this
 */
KuzzleDataCollection.prototype.fetch = function (documentId, cb) {
  var
    data = {_id: documentId},
    self = this;

  self.kuzzle.callbackRequired('KuzzleDataCollection.fetch', cb);
  data = self.kuzzle.addHeaders(data, this.headers);

  self.kuzzle.query(this.collection, 'read', 'get', data, function (err, res) {
    if (err) {
      return cb(err);
    }

    cb(null, new KuzzleDocument(self, res._id, res._source));
  });

  return this;
};

/**
 * Retrieves all documents stored in this data collection
 *
 * @param {responseCallback} cb - Handles the query response
 * @returns {Object} this
 */
KuzzleDataCollection.prototype.fetchAll = function (cb) {
  this.kuzzle.callbackRequired('KuzzleDataCollection.fetchAll', cb);

  this.advancedSearch({}, cb);

  return this;
};


/**
 * Instantiates a KuzzleDataMapping object containing the current mapping of this collection.
 *
 * @param {responseCallback} cb - Returns an instantiated KuzzleDataMapping object
 * @return {object} this
 */
KuzzleDataCollection.prototype.getMapping = function (cb) {
  var kuzzleMapping;

  this.kuzzle.callbackRequired('KuzzleDataCollection.getMapping', cb);

  kuzzleMapping = new KuzzleDataMapping(this);
  kuzzleMapping.refresh(cb);

  return this;
};

/**
 * Publish a realtime message
 * @param {object} document - either a KuzzleDocument instance or a JSON object
 * @returns {*} this
 */
KuzzleDataCollection.prototype.publish = function (document) {
  var data = {};

  if (document instanceof KuzzleDocument) {
    data = document.toJSON();
  } else {
    data.body = document;
  }

  data.persist = false;
  data = this.kuzzle.addHeaders(data, self.headers);
  this.kuzzle.query(this.collection, 'write', 'create', data);

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
  var
    self = this,
    data = {};

  if (content instanceof KuzzleDocument) {
    data = content.toJSON();
  } else {
    data.body = content;
  }

  data._id = documentId;
  data = self.kuzzle.addHeaders(data, this.headers);

  if (cb) {
    self.kuzzle.query(this.collection, 'write', 'createOrUpdate', data, function (err, res) {
      if (err) {
        return cb(err);
      }

      cb(null, new KuzzleDocument(self, res._id, res._source));
    });
  } else {
    self.kuzzle.query(this.collection, 'write', 'createOrUpdate', data);
  }

  return this;
};

/**
 * Subscribes to this data collection with a set of filters.
 * To subscribe to the entire data collection, simply provide an empty filter.
 *
 * @param {object} filters - Filters in Kuzzle DSL format
 * @param {responseCallback} cb - called for each new notification
 * @param {object} [options] - subscriptions options
 * @returns {*} KuzzleRoom object
 */
KuzzleDataCollection.prototype.subscribe = function (filters, cb, options) {
  var room;

  this.kuzzle.isValid();
  this.kuzzle.callbackRequired('KuzzleDataCollection.subscribe', cb);

  room = new KuzzleRoom(this, options);

  return room.renew(filters, cb);
};

/**
 * Update parts of a document
 *
 * @param {string} documentId - Unique document identifier of the document to update
 * @param {object} content - Either a KuzzleDocument or a JSON object representing the new document version
 * @param {responseCallback} [cb] - Returns an instantiated KuzzleDocument object
 * @return {object} this
 */
KuzzleDataCollection.prototype.update = function (documentId, content, cb) {
  var
    data = {},
    self = this;

  if (content instanceof KuzzleDocument) {
    data = content.toJSON();
  } else {
    data.body = content;
  }

  data._id = documentId;
  data = self.kuzzle.addHeaders(data, this.headers);

  if (cb) {
    self.kuzzle.query(this.collection, 'write', 'update', data, function (err, res) {
      var doc;
      if (err) {
        return cb(err);
      }

      doc = new KuzzleDocument(self, res._id);
      doc.refresh(cb);
    });
  } else {
    self.kuzzle.query(this.collection, 'write', 'update', data);
  }

  return self;
};

module.exports = KuzzleDataCollection;
