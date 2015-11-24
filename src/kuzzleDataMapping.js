/**
 * This is a global callback pattern, called by all asynchronous functions of the Kuzzle object.
 *
 * @callback responseCallback
 * @param {Object} err - Error object, NULL if the query is successful
 * @param {Object} data - The content of the query response
 */


/**
 *  When creating a new data collection in the persistent data storage layer, Kuzzle uses a default mapping.
 *  It means that, by default, you won’t be able to exploit the full capabilities of our persistent data storage layer
 *  (currently handled by ElasticSearch), and your searches may suffer from below-average performances, depending on
 *  the amount of data you stored in a collection and the complexity of your database.
 *
 *  The KuzzleDataMapping object allow to get the current mapping of a data collection and to modify it if needed.
 *
 * @param {object} kuzzleDataCollection - Instance of the inherited KuzzleDataCollection object
 * @constructor
 */
function KuzzleDataMapping(kuzzleDataCollection, mapping) {
  Object.defineProperties(this, {
    //read-only properties
    collection: {
      value: kuzzleDataCollection.collection,
      eunmerable: true
    },
    kuzzle: {
      value: kuzzleDataCollection.kuzzle,
      enumerable: true
    },
    // writable properties
    headers: {
      value: JSON.parse(JSON.stringify(kuzzleDataCollection.headers)),
      enumerable: true,
      writable: true
    },
    mapping: {
      value: mapping || {},
      enumerable: true,
      writable: true
    }
  });

  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var blacklist = ['set', 'setHeaders'];

        return passes && blacklist.indexOf(name) === -1;
      }
    });
  }

  return this;
}

/**
 * Applies the new mapping to the data collection.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 */
KuzzleDataMapping.prototype.apply = function (options, cb) {
  var
    self = this,
    data = this.kuzzle.addHeaders({body: {properties: this.mapping}}, this.headers);

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(this.collection, 'admin', 'putMapping', data, options, function (err, res) {
    if (err) {
      return cb ? cb(err) : false;
    }

    self.mapping = res._source.properties;

    if (cb) {
      cb(null, self);
    }
  });

  return this;
};

/**
 * Replaces the current content with the mapping stored in Kuzzle
 *
 * Calling this function will discard any uncommited changes. You can commit changes by calling the “apply” function
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {*} this
 */
KuzzleDataMapping.prototype.refresh = function (options, cb) {
  var
    self = this,
    data = this.kuzzle.addHeaders({}, this.headers);

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.query(this.collection, 'admin', 'getMapping', data, options, function (err, res) {
    if (err) {
      return cb ? cb(err) : false;
    }

    self.mapping = res.mainindex.mappings[self.collection].properties;

    if (cb) {
      cb(null, self);
    }
  });

  return this;
};


/**
 * Adds or updates a field mapping.
 *
 * Changes made by this function won’t be applied until you call the apply method
 *
 * @param {string} field - Name of the field from which the mapping is to be added or updated
 * @returns {KuzzleDataMapping}
 */
KuzzleDataMapping.prototype.set = function (field, mapping) {
  this.mapping[field] = mapping;

  return this;
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
KuzzleDataMapping.prototype.setHeaders = function (content, replace) {
  this.kuzzle.setHeaders.call(this, content, replace);
  return this;
};

module.exports = KuzzleDataMapping;
