/**
 * This is a global callback pattern, called by all asynchronous functions of the Kuzzle object.
 *
 * @callback responseCallback
 * @param {Object} err - Error object, NULL if the query is successful
 * @param {Object} [data] - The content of the query response
 */


/**
 *  When storing data or sending them through the real-time process, you may want to check if they meet some requirement
 *  called "validation specifications".
 *  
 *  The KuzzleDataValidation object allow to get the current validation specifications, to check them before to modify
 *  them and to validate data against them before to send them to Kuzzle.
 *
 * @param {object} kuzzleDataCollection - Instance of the inherited KuzzleDataCollection object
 * @param {object} specifications - the specifications
 * @constructor
 */
function KuzzleDataValidation(kuzzleDataCollection, specifications) {
  Object.defineProperties(this, {
    //read-only properties
    index: {
      value: kuzzleDataCollection.index,
      enumerable: true
    },
    collection: {
      value: kuzzleDataCollection.collection,
      enumerable: true
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
    specifications: {
      value: specifications || {},
      enumerable: true,
      writable: true
    }
  });

  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var blacklist = ['setHeaders'];

        return passes && blacklist.indexOf(name) === -1;
      }
    });
  }

  return this;
}

/**
 * Applies the new specifications to the data collection.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 */
KuzzleDataValidation.prototype.apply = function (options, cb) {
  var
    self = this,
    _rawData = {},
    data;

  _rawData[self.index] = {};
  _rawData[self.index][self.collection] = self.specifications;

  data = this.kuzzle.addHeaders({body: _rawData}, this.headers);

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(this.collection.buildQueryArgs('admin', 'updateSpecifications'), data, options, function (err) {
    if (err) {
      return cb && cb(err);
    }

    self.refresh(options, cb);
  });

  return this;
};

/**
 * Replaces the current content with the specifications stored in Kuzzle
 *
 * Calling this function will discard any uncommited changes. You can commit changes by calling the “apply” function
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {*} this
 */
KuzzleDataValidation.prototype.refresh = function (options, cb) {
  var
    self = this,
    data = this.kuzzle.addHeaders({}, this.headers);

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.query(this.collection.buildQueryArgs('admin', 'getSpecifications'), data, options, function (err, res) {
    if (err) {
      return cb ? cb(err) : false;
    }

    if (res.result[self.index]) {
      if (res.result[self.index][self.collection]) {
        self.specifications = res.result[self.index][self.collection].validation;
      } else {
        return cb && cb(new Error('No specifications found for collection ' + self.collection.collection));
      }
    } else {
      return cb && cb(new Error('No specifications found for index ' + self.collection.index));
    }

    if (cb) {
      cb(null, self);
    }
  });

  return this;
};

/**
 * Delete the specifications for the current collection in the current object and on Kuzzle
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {*} this
 */
KuzzleDataValidation.prototype.delete = function (options, cb) {
  var
    self = this,
    data = this.kuzzle.addHeaders({}, this.headers);

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.query(this.collection.buildQueryArgs('admin', 'deleteSpecifications'), data, options, function (err, res) {
    if (err) {
      return cb ? cb(err) : false;
    }

    self.specifications = {};

    if (cb) {
      cb(null, self);
    }
  });

  return this;
};

/**
 * Validate the current specifications syntax
 *
 * Calling this function will not store the current specifications into Kuzzle
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {*} this
 */
KuzzleDataValidation.prototype.validate = function (options, cb) {
  var
    self = this,
    data = this.kuzzle.addHeaders({}, this.headers);

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.query(this.collection.buildQueryArgs('admin', 'validateSpecifications'), data, options, function (err, res) {
    if (err) {
      return cb ? cb(err) : false;
    }

    if (res.error !== null) {
      return cb && cb(new Error(res.error.details.message));
    }

    if (cb) {
      cb(null, self);
    }
  });

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
KuzzleDataValidation.prototype.setHeaders = function (content, replace) {
  this.kuzzle.setHeaders.call(this, content, replace);
  return this;
};

module.exports = KuzzleDataValidation;
