var
  uuid = require('node-uuid'),
  io = require('socket.io-client'),
  KuzzleDataCollection = require('./kuzzleDataCollection');

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
  var self = this;

  if (!(this instanceof Kuzzle)) {
    return new Kuzzle(url, options, cb);
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (!url || url === '') {
    throw new Error('URL to Kuzzle can\'t be empty');
  }

  Object.defineProperties(this, {
    // 'private' properties
    collections: {
      value: {},
      writable: true
    },
    eventListeners: {
      value: {
        subscribed: [],
        unsubscribed: [],
        disconnected: [],
        reconnected: []
      }
    },
    queuing: {
      value: false,
      writable: true
    },
    requestHistory: {
      value: {},
      writable: true
    },
    socket: {
      value: null,
      writable: true
    },
    state: {
      value: 'initializing',
      writable: true
    },
    subscriptions: {
      /*
       Contains the centralized subscription list in the following format:
          pending: <number of pending subscriptions>
          'roomId': {
            kuzzleRoomID_1: kuzzleRoomInstance_1,
            kuzzleRoomID_2: kuzzleRoomInstance_2,
            kuzzleRoomID_...: kuzzleRoomInstance_...
          }

       This was made to allow multiple subscriptions on the same set of filters, something that Kuzzle does not permit.
       This structure also allows renewing subscriptions after a connection loss
       */
      value: {
        pending: {}
      },
      writable: true
    },
    // read-only properties
    autoReconnect: {
      value: (options && typeof options.autoReconnect === 'boolean') ? options.autoReconnect : true,
      enumerable: true
    },
    reconnectionDelay: {
      value: (options && typeof options.reconnectionDelay === 'number') ? options.reconnectionDelay : 1000,
      enumerable: true
    },
    url: {
      value: url,
      enumerable: true
    },
    // writable properties
    autoQueue: {
      value: false,
      enumerable: true,
      writable: true
    },
    autoReplay: {
      value: false,
      enumerable: true,
      writable: true
    },
    autoResubscribe: {
      value: true,
      enumerable: true,
      writable: true
    },
    headers: {
      value: {},
      enumerable: true,
      writable: true
    },
    metadata: {
      value: {},
      enumerable: true,
      writable: true
    },
    /*
      Offline queue use the following format:
            [
              {
                ts: <query timestamp>,
                query: 'query',
                cb: callbackFunction
              }
            ]
     */
    offlineQueue: {
      value: [],
      enumerable: true,
      writable: true
    },
    queueFilter: {
      value: null,
      enumerable: true,
      writable: true
    },
    queueMaxSize: {
      value: 500,
      enumerable: true,
      writable: true
    },
    queueTTL: {
      value: 120000,
      enumerable: true,
      writable: true
    },
    replayInterval: {
      value: 10,
      enumerable: true,
      writable: true
    }
  });

  if (options) {
    Object.keys(options).forEach(function (opt) {
      if (self.hasOwnProperty(opt) && Object.getOwnPropertyDescriptor(self, opt).writable) {
        self[opt] = options[opt];
      }
    });

    if (options.offlineMode === 'auto' && this.autoReconnect) {
      this.autoQueue = this.autoReplay = this.autoResubscribe = true;
    }
  }

  // Helper function ensuring that this Kuzzle object is still valid before performing a query
  Object.defineProperty(this, 'isValid', {
    value: function () {
      if (this.state === 'loggedOff') {
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


  if (!options || !options.connect || options.connect === 'auto') {
    this.connect(cb);
  } else {
    this.state = 'ready';
  }

  if (this.bluebird) {
    return this.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['connect', 'getAllStatistics', 'getStatistics', 'listCollections', 'now', 'query'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

  return this;
};


/**
 * Connects to a Kuzzle instance using the provided URL.
 * @param {responseCallback} [cb]
 * @returns {Object} this
 */
Kuzzle.prototype.connect = function (cb) {
  var self = this;

  if (['initializing', 'ready', 'loggedOff', 'error', 'offline'].indexOf(this.state) === -1) {
    if (cb) {
      cb(null, self);
    }
    return self;
  }

  self.state = 'connecting';

  self.socket = io(self.url, {
    reconnection: self.autoReconnect,
    reconnectionDelay: self.reconnectionDelay,
    'force new connection': true
  });

  self.socket.once('connect', function () {
    self.state = 'connected';

    Object.keys(self.subscriptions).forEach(function (roomId) {
      Object.keys(self.subscriptions[roomId]).forEach(function (subscriptionId) {
        var subscription = self.subscriptions[roomId][subscriptionId];
        subscription.renew(subscription.callback);
      });
    });

    dequeue.call(self);

    if (cb) {
      cb(null, self);
    }
  });

  self.socket.on('connect_error', function (error) {
    self.state = 'error';

    if (cb) {
      cb(error);
    }
  });

  self.socket.on('disconnect', function () {
    self.state = 'offline';

    if (!self.autoReconnect) {
      self.logout();
    }

    if (self.autoQueue) {
      self.queuing = true;
    }

    self.eventListeners.disconnected.forEach(function (listener) {
      listener.fn();
    });
  });

  self.socket.on('reconnect', function () {
    self.state = 'connected';

    // renew subscriptions
    if (self.autoResubscribe) {
      Object.keys(self.subscriptions).forEach(function (roomId) {
        Object.keys(self.subscriptions[roomId]).forEach(function (subscriptionId) {
          var subscription = self.subscriptions[roomId][subscriptionId];

          subscription.renew(subscription.callback);
        });
      });
    }

    // replay queued requests
    if (self.autoReplay) {
      cleanQueue.call(self);
      dequeue.call(self);
    }

    // alert listeners
    self.eventListeners.reconnected.forEach(function (listener) {
      listener.fn();
    });
  });

  return this;
};

/**
 * Clean up the queue, ensuring the queryTTL and queryMaxSize properties are respected
 */
function cleanQueue () {
  var
    self = this,
    now = Date.now(),
    lastDocumentIndex = -1;

  if (self.queueTTL > 0) {
    self.offlineQueue.forEach(function (query, index) {
      if (query.ts < now - self.queueTTL) {
        lastDocumentIndex = index;
      }
    });

    if (lastDocumentIndex !== -1) {
      self.offlineQueue.splice(0, lastDocumentIndex + 1);
    }
  }

  if (self.queueMaxSize > 0 && self.offlineQueue.length > self.queueMaxSize) {
    self.offlineQueue.splice(0, self.offlineQueue.length - self.queueMaxSize);
  }
}

/**
 * Emit a request to Kuzzle
 *
 * @param {object} request
 * @param {responseCallback} [cb]
 */
function emitRequest (request, cb) {
  var
    now = Date.now(),
    self = this;

  if (cb) {
    self.socket.once(request.requestId, function (response) {
      cb(response.error, response.result);
    });
  }

  self.socket.emit('kuzzle', request);

  // Track requests made to allow KuzzleRoom.subscribeToSelf to work
  self.requestHistory[request.requestId] = now;

  // Clean history from requests made more than 10s ago
  Object.keys(self.requestHistory).forEach(function (key) {
    if (self.requestHistory[key] < now - 10000) {
      delete self.requestHistory[key];
    }
  });
}

/**
 * Play all queued requests, in order.
 */
function dequeue () {
  var self = this;

  if (self.offlineQueue.length > 0) {
    emitRequest.call(self, self.offlineQueue[0].query, self.offlineQueue[0].cb);
    self.offlineQueue.shift();

    setTimeout(function () {
      dequeue.call(self);
    }, Math.max(0, self.replayInterval));
  } else {
    self.queuing = false;
  }
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

  if (listenerType !== 'function') {
    throw new Error('Invalid listener type: expected a function, got a ' + listenerType);
  }

  listenerId = uuid.v1();
  this.eventListeners[event].push({id: listenerId, fn: listener});

  return listenerId;
};


/**
 * Kuzzle monitors active connections, and ongoing/completed/failed requests.
 * This method returns all available statistics from Kuzzle.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 * @returns {object} this
 */
Kuzzle.prototype.getAllStatistics = function (options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.callbackRequired('Kuzzle.getAllStatistics', cb);

  this.query(null, 'admin', 'getAllStats', {}, options, function (err, res) {
    var result = [];

    if (err) {
      return cb(err);
    }

    Object.keys(res.statistics).forEach(function (key) {
      var frame = res.statistics[key];
      frame.timestamp = key;

      result.push(frame);
    });

    cb(null, result);
  });

  return this;
};

/**
 * Kuzzle monitors active connections, and ongoing/completed/failed requests.
 * This method allows getting either the last statistics frame, or a set of frames starting from a provided timestamp.
 *
 * @param {number} timestamp -  Epoch time. Starting time from which the frames are to be retrieved
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 * @returns {object} this
 */
Kuzzle.prototype.getStatistics = function (timestamp, options, cb) {
  var queryCB;

  if (!cb) {
    if (arguments.length === 1) {
      cb = arguments[0];
      options = null;
      timestamp = null;
    } else {
      cb = arguments[1];
      if (typeof arguments[0] === 'object') {
        options = arguments[0];
        timestamp = null;
      } else {
        timestamp = arguments[0];
        options = null;
      }
    }
  }

  queryCB = function (err, res) {
    var stats = [];

    if (err) {
      return cb(err);
    }

    Object.keys(res.statistics).forEach(function (frame) {
      res.statistics[frame].timestamp = frame;
      stats.push(res.statistics[frame]);
    });

    cb(null, stats);
  };

  this.callbackRequired('Kuzzle.getStatistics', cb);

  if (!timestamp) {
    this.query(null, 'admin', 'getLastStats', {}, options, queryCB);
  } else {
    this.query(null, 'admin', 'getStats', { body: { startTime: timestamp } }, options, queryCB);
  }

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
 * Empties the offline queue without replaying it.
 *
 * @returns {Kuzzle}
 */
Kuzzle.prototype.flushQueue = function () {
  this.offlineQueue = [];
  return this;
};

/**
 * Returns the list of known persisted data collections.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 * @returns {object} this
 */
Kuzzle.prototype.listCollections = function (options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.callbackRequired('Kuzzle.listCollections', cb);

  this.query(null, 'read', 'listCollections', {}, options, function (err, res) {
    if (err) {
      return cb(err);
    }

    return cb(null, res.collections);
  });

  return this;
};

/**
 * Disconnects from Kuzzle and invalidate this instance.
 */
Kuzzle.prototype.logout = function () {
  var collection;

  this.state = 'loggedOff';
  this.socket.close();
  this.socket = null;

  for (collection in this.collections) {
    if (this.collections.hasOwnProperty(collection)) {
      delete this.collections[collection];
    }
  }
};


/**
 * Return the current Kuzzle's UTC Epoch time, in milliseconds
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 * @returns {object} this
 */
Kuzzle.prototype.now = function (options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.callbackRequired('Kuzzle.now', cb);

  this.query(null, 'read', 'now', {}, options, function (err, res) {
    if (err) {
      return cb(err);
    }

    cb(null, res.now);
  });

  return this;
};


/**
 * This is a low-level method, exposed to allow advanced SDK users to bypass high-level methods.
 * Base method used to send read queries to Kuzzle
 *
 * Takes an optional argument object with the following properties:
 *    - metadata (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {string} collection - Name of the data collection you want to manipulate
 * @param {string} controller - The Kuzzle controller that will handle this query
 * @param {string} action - The controller action to perform
 * @param {object} query - The query data
 * @param {object} [options] - Optional arguments
 * @param {responseCallback} [cb] - Handles the query response
 */
Kuzzle.prototype.query = function (collection, controller, action, query, options, cb) {
  var
    attr,
    object = {
      action: action,
      controller: controller,
      metadata: this.metadata
    },
    self = this;

  this.isValid();

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (options) {
    if (options.metadata) {
      Object.keys(options.metadata).forEach(function (meta) {
        object.metadata[meta] = options.metadata[meta];
      });
    }

    if (options.queuable === false && self.state === 'offline') {
      return self;
    }
  }

  if (query.metadata) {
    Object.keys(query.metadata).forEach(function (meta) {
      object.metadata[meta] = query.metadata[meta];
    });
  }

  for (attr in query) {
    if (attr !== 'metadata' && query.hasOwnProperty(attr)) {
      object[attr] = query[attr];
    }
  }

  object = self.addHeaders(object, this.headers);

  if (collection) {
    object.collection = collection;
  }

  if (!object.requestId) {
    object.requestId = uuid.v4();
  }

  if (self.state === 'connected' || (options && options.queuable === false)) {
    emitRequest.call(this, object, cb);
  } else if (self.queuing|| ['initializing', 'connecting'].indexOf(self.state) !== -1) {
    cleanQueue.call(this, object, cb);

    if (self.queueFilter) {
      if (self.queueFilter(object)) {
        self.offlineQueue.push({ts: Date.now(), query: object, cb: cb});
      }
    } else {
      self.offlineQueue.push({ts: Date.now(), query: object, cb: cb});
    }
  }

  return self;
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

  if (event) {
    if (knownEvents.indexOf(event) === -1) {
      throw new Error('[' + event + '] is not a known event. Known events: ' + knownEvents.toString());
    }

    this.eventListeners[event] = [];
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

  if (knownEvents.indexOf(event) === -1) {
    throw new Error('[' + event + '] is not a known event. Known events: ' + knownEvents.toString());
  }

  this.eventListeners[event].forEach(function (listener, index) {
    if (listener.id === listenerId) {
      self.eventListeners[event].splice(index, 1);
    }
  });
};

/**
 * Replays the requests queued during offline mode.
 * Works only if the SDK is not in a disconnected state, and if the autoReplay option is set to false.
 */
Kuzzle.prototype.replayQueue = function () {
  if (this.state !== 'offline' && !this.autoReplay) {
    cleanQueue.call(this);
    dequeue.call(this);
  }

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
Kuzzle.prototype.setHeaders = function(content, replace) {
  var self = this;

  if (typeof content !== 'object' || Array.isArray(content)) {
    throw new Error('Expected a content object, received a ' + typeof content);
  }

  if (replace) {
    self.headers = content;
  } else {
    Object.keys(content).forEach(function (key) {
      self.headers[key] = content[key];
    });
  }

  return self;
};

/**
 * Starts the requests queuing. Works only during offline mode, and if the autoQueue option is set to false.
 */
Kuzzle.prototype.startQueuing = function () {
  if (this.state === 'offline' && !this.autoQueue) {
    this.queuing = true;
  }

  return this;
};

/**
 * Stops the requests queuing. Works only during offline mode, and if the autoQueue option is set to false.
 */
Kuzzle.prototype.stopQueuing = function () {
  if (this.state === 'offline' && !this.autoQueue) {
    this.queuing = false;
  }

  return this;
};
