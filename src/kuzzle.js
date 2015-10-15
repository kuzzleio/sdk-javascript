var
  uuid = require('node-uuid'),
  io = require('socket.io-client'),
  KuzzleDataCollection = require('./kuzzleDataCollection');

/**
 * This callback is called by the Kuzzle constructor once connection to a Kuzzle instance has been established.
 *
 * @callback Kuzzle~constructorCallback
 * @param {Object} err - Error object, NULL if connection is successful
 * @param {Object} data - Kuzzle instance
 */

/**
 * This is a global callback pattern, called by all asynchronous functions of the Kuzzle object.
 *
 * @callback responseCallback
 * @param {Object} err - Error object, NULL if the query is successful
 * @param {Object} data - The content of the query response
 */

/**
 * Kuzzle object constructor.
 * @param url - URL to the Kuzzle instance
 * @param [options] - Connection options
 * @param {Kuzzle~constructorCallback} [cb] - Handles connection response
 * @constructor
 */
module.exports = Kuzzle = function (url, options, cb) {
  Object.defineProperties(this, {
    // 'private' properties
    eventListeners: {
      value: {
        subscribed: [],
        unsubscribed: [],
        disconnected: []
      }
    },
    socket: {
      value: null,
      writable: true
    },
    // read-only properties
    collections: {
      value: {},
      enumerable: true,
      writable: true
    },
    // writable properties
    autoReconnect: {
      value: (options && options.autoReconnect) ? options.autoReconnect : true,
      enumerable: true,
      writable: true
    },
    headers: {
      value: (options && options.headers) ? options. headers : {},
      enumerable: true,
      writable: true
    },
    metadata: {
      value: {},
      enumerable: true,
      writable: true
    }
  });

  // Helper function ensuring that this Kuzzle object is still valid before performing a query
  Object.defineProperty(this, 'isValid', {
    value: function () {
      if (this.socket === null) {
        throw new Error('This Kuzzle object has been invalidated. Did you try to access it after a logout call?');
      }
    }
  });

  // Helper function copying headers to the query data
  Object.defineProperty(this, 'addHeaders', {
    value: function (query, headers) {
      Object.keys(headers).forEach(function (header) {
        if (!query[header]) {
          query[header] = headers[header];
        }
      });

      return query;
    }
  });

  /*
   * Some methods (mainly read queries) require a callback function. This function exists to avoid repetition of code,
   * and is called by these methods
   */
  Object.defineProperty(this, 'callbackRequired', {
    value: function (errorMessagePrefix, callback) {
      if (!callback || typeof callback !== 'function') {
        throw new Error(errorMessagePrefix + ': a callback argument is required for read queries');
      }
    }
  });

  construct.call(this, url, cb);

  if (this.bluebird) {
    return this.bluebird.promisifyAll(this);
  }

  return this;
};


/**
 * Connects to a Kuzzle instance using the provided URL.
 * @param url
 * @param {Kuzzle~constructorCallback} [cb]
 * @returns {Object} this
 */
function construct(url, cb) {
  var self = this;

  if (!url || url === '') {
    throw new Error('URL to Kuzzle can\'t be empty');
  }

  this.socket = io(url);

  this.socket.once('connect', function () {
    // TODO: initialize kuzzle-provided properties (applicationId, connectionId, connectionTimestamp)
    if (cb) {
      cb(null, self);
    }
  });

  this.socket.once('error', function (error) {
    // TODO: Invalidate this object for now. Should handle the autoReconnect flag later
    self.logout();

    if (cb) {
      cb(error);
    }
  });

  this.socket.on('disconnect', function () {
    self.eventListeners.disconnected.forEach(function (listener) {
      listener();
    });
  });

  return this;
}

/**
 * Adds a listener to a Kuzzle global event. When an event is fired, listeners are called in the order of their
 * insertion.
 *
 * The ID returned by this function is required to remove this listener at a later time.
 *
 * @param {string} event - name of the global event to subscribe to (see the 'eventListeners' object property)
 * @param {function} listener - callback to invoke each time an event is fired
 * @returns {string} Unique listener ID
 */
Kuzzle.prototype.addListener = function(event, listener) {
  var
    knownEvents = Object.keys(this.eventListeners),
    listenerType = typeof listener,
    listenerId;

  this.isValid();

  if (knownEvents.indexOf(event) === -1) {
    throw new Error('[' + event + '] is not a known event. Known events: ' + knownEvents.toString());
  }

  if (typeof listenerType !== 'function') {
    throw new Error('Invalid listener type: expected a function, got a ' + listenerType);
  }

  listenerId = uuid.v1();
  this.eventListeners[event].push({id: listenerId, fn: listener});

  return listenerId;
};

/**
 * Count the number of other connected clients to Kuzzle
 * @param {responseCallback} cb - Handles the query response
 * @returns {object} this
 */
Kuzzle.prototype.count = function (cb) {
  this.isValid();
  this.callbackRequired('Kuzzle.count', cb);

  // TODO
  cb(null, {count: 0});

  return this;
};

/**
 * Create a new instance of a KuzzleDataCollection object
 * @param {string} collection - The name of the data collection you want to manipulate
 * @param headers {object} [headers] - Common properties for all future write documents queries
 * @returns {object} A KuzzleDataCollection instance
 */
Kuzzle.prototype.dataCollectionFactory = function(collection, headers) {
  this.isValid();

  if (!this.collections[collection]) {
    this.collections[collection] = new KuzzleDataCollection(this, collection, headers);
  }

  return this.collections[collection];
};

/**
 * Disconnects from Kuzzle and invalidate this instance.
 */
Kuzzle.prototype.logout = function () {
  var collection;

  this.socket.close();
  this.socket = null;

  for (collection in this.collections) {
    if (this.collections.hasOwnProperty(collection)) {
      delete this.collections[collection];
    }
  }
};


/**
 * Returns the current Kuzzle UTC timestamp
 * @param {responseCallback} cb - Handles the query response
 * @returns {object} this
 */
Kuzzle.prototype.now = function (cb) {
  this.isValid();
  this.callbackRequired('Kuzzle.now', cb);

  // TODO
  cb(null, {now: 0xBADDCAFE});

  return this;
};

/**
 * This is a low-level method, exposed to allow advanced SDK users to bypass high-level methods.
 * Base method used to send read queries to Kuzzle
 *
 * @param {string} collection - Name of the data collection you want to manipulate
 * @param {string} controller - The Kuzzle controller that will handle this query
 * @param {string} action - The controller action to perform
 * @param {object} query - The query data
 * @param {responseCallback} [cb] - Handles the query response
 */
Kuzzle.prototype.query = function (collection, controller, action, query, cb) {
  var
    attr,
    object = {
      requestId: uuid.v1(),
      action: action
    };

  if (collection) {
    object.collection = collection;
  }

  this.isValid();

  if (cb) {
    this.socket.once(object.requestId, function (response) {
      cb(response.error, response.result);
    });
  }

  for (attr in query) {
    if (query.hasOwnProperty(attr)) {
      object[attr] = query[attr];
    }
  }

  object = this.addHeaders(object, this.headers);

  this.socket.emit(controller, object);

  return this;
};

/**
 * Removes all listeners, either from a specific event or from all events
 *
 * @param {string} event - One of the event described in the Event Handling section of this documentation
 */
Kuzzle.prototype.removeAllListeners = function (event) {
  var
    knownEvents = Object.keys(this.eventListeners),
    self = this;

  this.isValid();

  if (event) {
    if (knownEvents.indexOf(event) === -1) {
      throw new Error('[' + event + '] is not a known event. Known events: ' + knownEvents.toString());
    }

    this.eventsListeners[event] = [];
  } else {
    knownEvents.forEach(function (eventName) {
      self.eventListeners[eventName] = [];
    });
  }
};

/**
 * Removes a listener from an event.
 *
 * @param {string} event - One of the event described in the Event Handling section of this documentation
 * @param {string} listenerId - The ID returned by addListener
 */
Kuzzle.prototype.removeListener = function (event, listenerId) {
  var
    knownEvents = Object.keys(this.eventListeners),
    self = this;

  this.isValid();

  if (knownEvents.indexOf(event) === -1) {
    throw new Error('[' + event + '] is not a known event. Known events: ' + knownEvents.toString());
  }

  this.eventListeners[event].forEach(function (listener, index) {
    if (listener.id === listenerId) {
      self.eventListeners[event].splice(index, 1);
    }
  });
};


