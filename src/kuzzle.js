var
  uuid = require('uuid'),
  KuzzleDataCollection = require('./kuzzleDataCollection'),
  KuzzleSecurity = require('./security/kuzzleSecurity'),
  KuzzleMemoryStorage = require('./kuzzleMemoryStorage'),
  KuzzleUser = require('./security/kuzzleUser'),
  networkWrapper = require('./networkWrapper');

/**
 * This is a global callback pattern, called by all asynchronous functions of the Kuzzle object.
 *
 * @callback responseCallback
 * @param {Object} err - Error object, NULL if the query is successful
 * @param {Object} [data] - The content of the query response
 */

/**
 * Kuzzle object constructor.
 *
 * @constructor
 * @param host - Server name or IP Address to the Kuzzle instance
 * @param [options] - Connection options
 * @param {responseCallback} [cb] - Handles connection response
 * @constructor
 */
module.exports = Kuzzle = function (host, options, cb) {
  var self = this;

  if (!(this instanceof Kuzzle)) {
    return new Kuzzle(host, options, cb);
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (!host || host === '') {
    throw new Error('host argument missing');
  }

  Object.defineProperties(this, {
    // 'private' properties
    collections: {
      value: {},
      writable: true
    },
    connectCB: {
      value: cb
    },
    eventListeners: {
      value: {
        connected: {lastEmitted: null, listeners: []},
        error: {lastEmitted: null, listeners: []},
        disconnected: {lastEmitted: null, listeners: []},
        reconnected: {lastEmitted: null, listeners: []},
        jwtTokenExpired: {lastEmitted: null, listeners: []},
        loginAttempt: {lastEmitted: null, listeners: []},
        offlineQueuePush: {listeners: []},
        offlineQueuePop: {listeners: []},
        queryError: {listeners: []}
      }
    },
    eventTimeout: {
      value: 200
    },
    queuing: {
      value: false,
      writable: true
    },
    requestHistory: {
      value: {},
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
    defaultIndex: {
      value: (options && typeof options.defaultIndex === 'string') ? options.defaultIndex : undefined,
      writable: true,
      enumerable: true
    },
    reconnectionDelay: {
      value: (options && typeof options.reconnectionDelay === 'number') ? options.reconnectionDelay : 1000,
      enumerable: true
    },
    host: {
      value: host,
      writable: true,
      enumerable: true
    },
    wsPort: {
      value: (options && typeof options.wsPort === 'number') ? options.wsPort : 7513,
      enumerable: true,
      writable: true
    },
    ioPort: {
      value: (options && typeof options.ioPort === 'number') ? options.ioPort : 7512,
      enumerable: true,
      writable: true
    },
    sslConnection: {
      value: (options && typeof options.sslConnection === 'boolean') ? options.sslConnection : false,
      enumerable: true
    },
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
    },
    jwtToken: {
      value: undefined,
      enumerable: true,
      writable: true
    },
    offlineQueueLoader: {
      value: null,
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
      if (self.state === 'disconnected') {
        throw new Error('This Kuzzle object has been invalidated. Did you try to access it after a disconnect call?');
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

  /**
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

  /**
   * Create an attribute security that embed all methods to manage Role, Profile and User
   */
  Object.defineProperty(this, 'security', {
    value: new KuzzleSecurity(this),
    enumerable: true
  });

  /**
   * Emit an event to all registered listeners
   * An event cannot be emitted multiple times before a timeout has been reached.
   */
  Object.defineProperty(this, 'emitEvent', {
    value: function emitEvent(event) {
      var
        now = Date.now(),
        args = Array.prototype.slice.call(arguments, 1),
        eventProperties = this.eventListeners[event];

      if (eventProperties.lastEmitted && eventProperties.lastEmitted >= now - this.eventTimeout) {
        return false;
      }

      eventProperties.listeners.forEach(function (listener) {
        process.nextTick(function () {
          listener.fn.apply(undefined, args);
        });
      });

      // Events without the 'lastEmitted' property can be emitted without minimum time between emissions
      if (eventProperties.lastEmitted !== undefined) {
        eventProperties.lastEmitted = now;
      }
    }
  });

  Object.defineProperty(this, 'memoryStorage', {
    value: new KuzzleMemoryStorage(this),
    enumerable: true
  });


  if (!options || !options.connect || options.connect === 'auto') {
    this.connect();
  } else {
    this.state = 'ready';
  }

  cleanHistory(this.requestHistory);

  if (this.bluebird) {
    return this.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['getAllStatistics', 'getServerInfo', 'getStatistics',
          'listCollections', 'listIndexes', 'login', 'logout', 'now', 'query',
          'checkToken', 'whoAmI', 'updateSelf', 'getMyRights',
          'refreshIndex', 'getAutoRefresh', 'setAutoRefresh'
        ];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }
};

/**
 * Connects to a Kuzzle instance using the provided host name.
 * @returns {Object} this
 */
Kuzzle.prototype.connect = function () {
  var self = this;

  if (self.network) {
    self.disconnect();
  }

  self.network = networkWrapper(self.host, self.wsPort, self.ioPort, self.sslConnection);

  if (['initializing', 'ready', 'disconnected', 'error', 'offline'].indexOf(this.state) === -1) {
    if (self.connectCB) {
      self.connectCB(null, self);
    }
    return self;
  }

  self.state = 'connecting';
  self.network.connect(self.autoReconnect, self.reconnectionDelay);

  self.network.onConnect(function () {
    self.state = 'connected';
    renewAllSubscriptions.call(self);
    dequeue.call(self);
    self.emitEvent('connected');

    if (self.connectCB) {
      self.connectCB(null, self);
    }
  });

  self.network.onConnectError(function (error) {
    var connectionError = new Error('Unable to connect to kuzzle proxy server at "' + self.host + '"');

    connectionError.internal = error;
    self.state = 'error';
    self.emitEvent('error', connectionError);

    if (self.connectCB) {
      self.connectCB(connectionError);
    }
  });

  self.network.onDisconnect(function () {
    self.state = 'offline';

    if (!self.autoReconnect) {
      self.disconnect();
    }

    if (self.autoQueue) {
      self.queuing = true;
    }

    self.emitEvent('disconnected');
  });

  self.network.onReconnect(function () {
    var reconnect = function () {
      // renew subscriptions
      if (self.autoResubscribe) {
        renewAllSubscriptions.call(self);
      }

      // replay queued requests
      if (self.autoReplay) {
        cleanQueue.call(self);
        dequeue.call(self);
      }

      // alert listeners
      self.emitEvent('reconnected');
    };

    self.state = 'connected';

    if (self.jwtToken) {
      self.checkToken(self.jwtToken, function (err, res) {
        // shouldn't obtain an error but let's invalidate the token anyway
        if (err || !res.valid) {
          self.jwtToken = undefined;
          self.emitEvent('jwtTokenExpired');
        }

        reconnect();
      });
    } else {
      reconnect();
    }
  });

  return this;
};

/**
 * Set the jwtToken used to query kuzzle
 * @param token
 * @returns {Kuzzle}
 */
Kuzzle.prototype.setJwtToken = function(token) {
  if (typeof token === 'string') {
    this.jwtToken = token;
  } else if (typeof token === 'object') {
    if (token.result && token.result.jwt && typeof token.result.jwt === 'string') {
      this.jwtToken = token.result.jwt;
    } else {
      this.emitEvent('loginAttempt', {
        success: false,
        error: 'Cannot find a valid JWT token in the following object: ' + JSON.stringify(token)
      });

      return this;
    }
  } else {
    this.emitEvent('loginAttempt', {success: false, error: 'Invalid token argument: ' + token});
    return this;
  }

  renewAllSubscriptions.call(this);
  this.emitEvent('loginAttempt', {success: true});
  return this;
};

/**
 * Unset the jwtToken used to query kuzzle
 * @returns {Kuzzle}
 */
Kuzzle.prototype.unsetJwtToken = function() {
  this.jwtToken = undefined;

  removeAllSubscriptions.call(this);

  return this;
};

/**
 * Get the jwtToken used by kuzzle
 * @returns {Kuzzle}
 */
Kuzzle.prototype.getJwtToken = function() {
  return this.jwtToken;
};

/**
 * Send login request to kuzzle with credentials
 * If login success, store the jwtToken into kuzzle object
 *
 * @param strategy
 * @param credentials
 * @param expiresIn
 * @param cb
 */
Kuzzle.prototype.login = function (strategy) {
  var
    self = this,
    request = {
      strategy: strategy
    },
    credentials,
    cb = null;

  // Handle arguments (credentials, expiresIn, cb)
  if (arguments[1]) {
    if (typeof arguments[1] === 'object') {
      credentials = arguments[1];
    } else if (typeof arguments[1] === 'number' || typeof arguments[1] === 'string') {
      request.expiresIn = arguments[1];
    } else if (typeof arguments[1] === 'function') {
      cb = arguments[1];
    }
  }
  if (arguments[2]) {
    if (typeof arguments[2] === 'number' || typeof arguments[2] === 'string') {
      request.expiresIn = arguments[2];
    } else if (typeof arguments[2] === 'function') {
      cb = arguments[2];
    }
  }
  if (arguments[3] && typeof arguments[3] === 'function') {
    cb = arguments[3];
  }

  if (typeof credentials === 'object') {
    Object.keys(credentials).forEach(function (key) {
      request[key] = credentials[key];
    });
  }

  this.query({controller: 'auth', action: 'login'}, {body: request}, {queuable: false}, function(error, response) {
    if (!error) {
      if (response.result.jwt) {
        self.setJwtToken(response.result.jwt);
      }

      cb && cb(null, response.result);
    }
    else {
      cb && cb(error);
      self.emitEvent('loginAttempt', {success: false, error: error.message});
    }
  });
};

/**
 * Send logout request to kuzzle with jwtToken.
 *
 * @param cb
 * @returns {Kuzzle}
 */
Kuzzle.prototype.logout = function (cb) {
  var
    self = this,
    request = {
      action: 'logout',
      controller: 'auth',
      requestId: uuid.v4(),
      body: {}
    };

  this.query({controller: 'auth', action: 'logout'}, request, {queuable: false}, typeof cb !== 'function' ? null : function(error) {
    if (error === null) {
      self.unsetJwtToken();
      cb(null, self);
    }
    else {
      cb(error);
    }
  });

  return self;
};

/**
 * Checks whether a given jwt token still represents a valid session in Kuzzle.
 *
 * @param  {string}   token     The jwt token to check
 * @param  {function} callback  The callback to be called when the response is
 *                              available. The signature is `function(error, response)`.
 */
Kuzzle.prototype.checkToken = function (token, callback) {
  var
    request = {
      body: {
        token: token
      }
    };

  this.callbackRequired('Kuzzle.checkToken', callback);

  this.query({controller: 'auth', action: 'checkToken'}, request, {queuable: false}, function (err, response) {
    if (err) {
      return callback(err);
    }

    callback(null, response.result);
  });
};

/**
 * Fetches the current user.
 *
 * @param  {function} callback  The callback to be called when the response is
 *                              available. The signature is `function(error, response)`.
 */
Kuzzle.prototype.whoAmI = function (callback) {
  var self = this;

  self.callbackRequired('Kuzzle.whoAmI', callback);

  self.query({controller: 'auth', action: 'getCurrentUser'}, {}, {}, function (err, response) {
    if (err) {
      return callback(err);
    }

    callback(null, new KuzzleUser(self.security, response.result._id, response.result._source));
  });
};

/**
 * Gets the rights array of the currently logged user.
 *
 * @param {object} [options] - Optional parameters
 * @param  {function} cb The callback containing the normalized array of rights.
 */
Kuzzle.prototype.getMyRights = function (options, cb) {
  var self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.callbackRequired('Kuzzle.getMyRights', cb);

  self.query({controller: 'auth', action:'getMyRights'}, {}, options, function (err, res) {
    if (err) {
      return cb(err);
    }

    cb(null, res.result.hits);
  });
};

/**
 * Update current user in Kuzzle.
 *
 * @param {object} content - a plain javascript object representing the user's modification
 * @param {object} [options] - (optional) arguments
 * @param {responseCallback} [cb] - (optional) Handles the query response
 * @returns {Kuzzle} this object
 */
Kuzzle.prototype.updateSelf = function (content, options, cb) {
  var
    self = this,
    data = {},
    queryArgs = {controller: 'auth', action: 'updateSelf'};

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data.body = content;

  self.query(queryArgs, data, options, cb && function (err, res) {
    cb(err, err ? undefined : res.result);
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
      self.offlineQueue
        .splice(0, lastDocumentIndex + 1)
        .forEach(function (droppedRequest) {
          self.emitEvent('offlineQueuePop', droppedRequest.query);
        });
    }
  }

  if (self.queueMaxSize > 0 && self.offlineQueue.length > self.queueMaxSize) {
    self.offlineQueue
      .splice(0, self.offlineQueue.length - self.queueMaxSize)
      .forEach(function (droppedRequest) {
        self.emitEvent('offlineQueuePop', droppedRequest.query);
      });
  }
}


/**
 * Clean history from requests made more than 10s ago
 */
function cleanHistory (requestHistory) {
  var
    now = Date.now();

  Object.keys(requestHistory).forEach(function (key) {
    if (requestHistory[key] < now - 10000) {
      delete requestHistory[key];
    }
  });

  setTimeout(function () {
    cleanHistory(requestHistory);
  }, 1000);
}

/**
 * Emit a request to Kuzzle
 *
 * @param {object} request
 * @param {responseCallback} [cb]
 */
function emitRequest (request, cb) {
  var
    self = this;

  if (self.jwtToken !== undefined || cb) {
    self.network.once(request.requestId, function (response) {
      var error = null;

      if (request.action !== 'logout' && response.error && response.error.message === 'Token expired') {
        self.jwtToken = undefined;
        self.emitEvent('jwtTokenExpired', request, cb);
      }

      if (response.error) {
        error = new Error(response.error.message);
        Object.assign(error, response.error);
        error.status = response.status;
        self.emitEvent('queryError', error, request, cb);
      }

      if (cb) {
        cb(error, response);
      }
    });
  }

  this.network.send(request);

  // Track requests made to allow KuzzleRoom.subscribeToSelf to work
  self.requestHistory[request.requestId] = Date.now();
}

/**
 * Play all queued requests, in order.
 */
function dequeue () {
  var
    self = this,
    additionalQueue,
    uniqueQueue = {},
    dequeuingProcess = function () {
      if (self.offlineQueue.length > 0) {
        emitRequest.call(self, self.offlineQueue[0].query, self.offlineQueue[0].cb);
        self.emitEvent('offlineQueuePop', self.offlineQueue.shift());

        setTimeout(function () {
          dequeuingProcess();
        }, Math.max(0, self.replayInterval));
      } else {
        self.queuing = false;
      }
    };

  if (self.offlineQueueLoader) {
    if (typeof self.offlineQueueLoader !== 'function') {
      throw new Error('Invalid value for offlineQueueLoader property. Expected: function. Got: ' + typeof self.offlineQueueLoader);
    }

    additionalQueue = self.offlineQueueLoader();
    if (Array.isArray(additionalQueue)) {
      self.offlineQueue = additionalQueue
        .concat(self.offlineQueue)
        .filter(function (request) {
          // throws if the query object does not contain required attributes
          if (!request.query || request.query.requestId === undefined || !request.query.action || !request.query.controller) {
            throw new Error('Invalid offline queue request. One or more missing properties: requestId, action, controller.');
          }

          return uniqueQueue.hasOwnProperty(request.query.requestId) ? false : (uniqueQueue[request.query.requestId] = true);
        });
    } else {
      throw new Error('Invalid value returned by the offlineQueueLoader function. Expected: array. Got: ' + typeof additionalQueue);
    }
  }

  dequeuingProcess();
}

/**
 * Renew all registered subscriptions. Triggered either by a successful connection/reconnection or by a
 * successful login attempt
 */
function renewAllSubscriptions() {
  var self = this;

  Object.keys(self.subscriptions).forEach(function (roomId) {
    Object.keys(self.subscriptions[roomId]).forEach(function (subscriptionId) {
      var subscription = self.subscriptions[roomId][subscriptionId];
      subscription.renew(subscription.callback);
    });
  });
}

/**
 * Remove all registered subscriptions. Triggered either by a logout query or by un-setting the token
 */
function removeAllSubscriptions() {
  var self = this;

  Object.keys(self.subscriptions).forEach(function (roomId) {
    Object.keys(self.subscriptions[roomId]).forEach(function (subscriptionId) {
      var subscription = self.subscriptions[roomId][subscriptionId];
      subscription.unsubscribe();
    });
  });
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

  listenerId = uuid.v4();
  this.eventListeners[event].listeners.push({id: listenerId, fn: listener});
  return listenerId;
};


/**
 * Kuzzle monitors active connections, and ongoing/completed/failed requests.
 * This method returns all available statistics from Kuzzle.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 */
Kuzzle.prototype.getAllStatistics = function (options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.callbackRequired('Kuzzle.getAllStatistics', cb);

  this.query({controller:'admin', action: 'getAllStats'}, {}, options, function (err, res) {
    if (err) {
      return cb(err);
    }

    cb(null, res.result.hits);
  });
};

/**
 * Kuzzle monitors active connections, and ongoing/completed/failed requests.
 * This method allows getting either the last statistics frame, or a set of frames starting from a provided timestamp.
 *
 * @param {number} timestamp -  Epoch time. Starting time from which the frames are to be retrieved
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 */
Kuzzle.prototype.getStatistics = function (timestamp, options, cb) {
  var
    queryCB,
    body;

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
    if (err) {
      return cb(err);
    }

    cb(null, timestamp ? res.result.hits : [res.result]);
  };

  this.callbackRequired('Kuzzle.getStatistics', cb);

  body = timestamp ? {body: {startTime: timestamp}} : {};
  this.query({controller: 'admin', action: timestamp ? 'getStats' : 'getLastStats'}, body, options, queryCB);
};

/**
 * Create a new instance of a KuzzleDataCollection object.
 * If no index is specified, takes the default index.
 *
 * @param {string} collection - The name of the data collection you want to manipulate
 * @param {string} [index] - The name of the data index containing the data collection
 * @returns {object} A KuzzleDataCollection instance
 */
Kuzzle.prototype.dataCollectionFactory = function(collection, index) {
  this.isValid();

  if (!index) {
    if (!this.defaultIndex) {
      throw new Error('Unable to create a new data collection object: no index specified');
    }

    index = this.defaultIndex;
  }

  if (typeof index !== 'string' || typeof collection !== 'string') {
    throw new Error('Invalid index or collection argument: string expected');
  }

  if (!this.collections[index]) {
    this.collections[index] = {};
  }

  if (!this.collections[index][collection]) {
    this.collections[index][collection] = new KuzzleDataCollection(this, collection, index);
  }

  return this.collections[index][collection];
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
 * @param {string} [index] - Index containing collections to be listed
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 */
Kuzzle.prototype.listCollections = function () {
  var
    collectionType = 'all',
    index,
    options,
    cb,
    args = Array.prototype.slice.call(arguments),
    query;

  args.forEach(function(arg) {
    switch (typeof arg) {
      case 'string':
        index = arg;
        break;
      case 'object':
        options = arg;
        break;
      case 'function':
        cb = arg;
        break;
    }
  });

  if (!index) {
    if (!this.defaultIndex) {
      throw new Error('Kuzzle.listCollections: index required');
    }

    index = this.defaultIndex;
  }

  this.callbackRequired('Kuzzle.listCollections', cb);

  if (options && options.type) {
    collectionType = options.type;
  }

  query = {body: {type: collectionType}};

  if (options && options.from) {
    query.body.from = options.from;
  }

  if (options && options.size) {
    query.body.size = options.size;
  }

  this.query({index: index, controller: 'read', action: 'listCollections'}, query, options, function (err, res) {
    if (err) {
      return cb(err);
    }

    cb(null, res.result.collections);
  });
};

/**
 * Returns the list of existing indexes in Kuzzle
 *
 * @param {object} [options] - Optional arguments
 * @param {responseCallback} cb - Handles the query response
 */
Kuzzle.prototype.listIndexes = function (options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.callbackRequired('Kuzzle.listIndexes', cb);

  this.query({controller: 'read', action: 'listIndexes'}, {}, options, function (err, res) {
    cb(err, err ? undefined : res.result.indexes);
  });
};

/**
 * Disconnects from Kuzzle and invalidate this instance.
 */
Kuzzle.prototype.disconnect = function () {
  var collection;

  this.state = 'disconnected';
  this.network.close();
  this.network = null;

  for (collection in this.collections) {
    if (this.collections.hasOwnProperty(collection)) {
      delete this.collections[collection];
    }
  }
};

/**
 * Returns the server informations
 *
 * @param {object} [options] - Optional arguments
 * @param {responseCallback} cb - Handles the query response
 */
Kuzzle.prototype.getServerInfo = function (options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.callbackRequired('Kuzzle.getServerInfo', cb);

  this.query({controller: 'read', action: 'serverInfo'}, {}, options, function (err, res) {
    if (err) {
      return cb(err);
    }

    cb(null, res.result.serverInfo);
  });
};

/**
 * Forces an index refresh
 *
 * @param {string} index - The index to refresh. Defaults to Kuzzle.defaultIndex
 * @param {object} options - Optional arguments
 * @param {responseCallback} cb - Handles the query response
 * @returns {Kuzzle}
 */
Kuzzle.prototype.refreshIndex = function () {
  var
    index,
    options,
    cb;

  Array.prototype.slice.call(arguments).forEach(function(arg) {
    switch (typeof arg) {
      case 'string':
        index = arg;
        break;
      case 'object':
        options = arg;
        break;
      case 'function':
        cb = arg;
        break;
    }
  });

  if (!index) {
    if (!this.defaultIndex) {
      throw new Error('Kuzzle.refreshIndex: index required');
    }
    index = this.defaultIndex;
  }

  this.query({ index: index, controller: 'admin', action: 'refreshIndex'}, {}, options, cb);

  return this;
};

/**
 * Returns de current autoRefresh status for the given index
 *
 * @param {string} index - The index to get the status from. Defaults to Kuzzle.defaultIndex
 * @param {object} options - Optinal arguments
 * @param {responseCallback} cb - Handles the query response
 */
Kuzzle.prototype.getAutoRefresh = function () {
  var
    index,
    options,
    cb;

  Array.prototype.slice.call(arguments).forEach(function (arg) {
    switch (typeof arg) {
      case 'string':
        index = arg;
        break;
      case 'object':
        options = arg;
        break;
      case 'function':
        cb = arg;
        break;
    }
  });

  if (!index) {
    if (!this.defaultIndex) {
      throw new Error('Kuzzle.getAutoRefresh: index required');
    }
    index = this.defaultIndex;
  }

  this.callbackRequired('Kuzzle.getAutoRefresh', cb);
  this.query({ index: index, controller: 'admin', action: 'getAutoRefresh'}, {}, options, cb);
};

/**
 * (Un)Sets the autoRefresh flag on the given index
 *
 * @param {string} index - the index to modify. Defaults to Kuzzle.defaultIndex
 * @param {boolean} autoRefresh - The autoRefresh value to set
 * @param {object} options - Optional arguments
 * @param {responseCallback} cb - Handles the query result
 * @returns {object} this
 */
Kuzzle.prototype.setAutoRefresh = function () {
  var
    index,
    autoRefresh,
    options,
    cb;

  Array.prototype.slice.call(arguments).forEach(function (arg) {
    switch (typeof arg) {
      case 'string':
        index = arg;
        break;
      case 'boolean':
        autoRefresh = arg;
        break;
      case 'object':
        options = arg;
        break;
      case 'function':
        cb = arg;
        break;
    }
  });

  if (!index) {
    if (!this.defaultIndex) {
      throw new Error('Kuzzle.setAutoRefresh: index required');
    }
    index = this.defaultIndex;
  }

  if (autoRefresh === undefined) {
    throw new Error('Kuzzle.setAutoRefresh: autoRefresh value is required');
  }

  this.query({ index: index, controller: 'admin', action: 'setAutoRefresh'}, { body: { autoRefresh: autoRefresh }}, options, cb);

  return this;
};

/**
 * Return the current Kuzzle's UTC Epoch time, in milliseconds
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 */
Kuzzle.prototype.now = function (options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.callbackRequired('Kuzzle.now', cb);

  this.query({controller: 'read', action: 'now'}, {}, options, function (err, res) {
    cb(err, res && res.result.now);
  });
};

/**
 * This is a low-level method, exposed to allow advanced SDK users to bypass high-level methods.
 * Base method used to send read queries to Kuzzle
 *
 * Takes an optional argument object with the following properties:
 *    - metadata (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {object} queryArgs - Query configuration
 * @param {object} query - The query data
 * @param {object} [options] - Optional arguments
 * @param {responseCallback} [cb] - Handles the query response
 */
Kuzzle.prototype.query = function (queryArgs, query, options, cb) {
  var
    attr,
    object = {
      action: queryArgs.action,
      controller: queryArgs.controller,
      metadata: this.metadata
    },
    self = this;

  this.isValid();

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (options) {
    if (options.queuable === false && self.state === 'offline') {
      return self;
    }

    if (options.refresh) {
      object.refresh = options.refresh;
    }

    if (options.metadata) {
      Object.keys(options.metadata).forEach(function (meta) {
        object.metadata[meta] = options.metadata[meta];
      });
    }
  }

  if (!query || typeof query !== 'object' || Array.isArray(query)) {
    throw new Error('Invalid query parameter: ' + query);
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

  /*
   * Do not add the token for the checkToken route, to avoid getting a token error when
   * a developer simply wish to verify his token
   */
  if (self.jwtToken !== undefined && !(object.controller === 'auth' && object.action === 'checkToken')) {
    object.jwt = self.jwtToken;
  }

  if (queryArgs.collection) {
    object.collection = queryArgs.collection;
  }

  if (queryArgs.index) {
    object.index = queryArgs.index;
  }

  if (!object.requestId) {
    object.requestId = uuid.v4();
  }

  if (self.state === 'connected' || (options && options.queuable === false)) {
    if (self.state === 'connected') {
      emitRequest.call(this, object, cb);
    } else if (cb) {
      cb(new Error('Unable to execute request: not connected to a Kuzzle server.\nDiscarded request: ' + JSON.stringify(object)));
    }
  } else if (self.queuing || ['initializing', 'connecting'].indexOf(self.state) !== -1) {
    cleanQueue.call(this, object, cb);

    if (!self.queueFilter || self.queueFilter(object)) {
      self.offlineQueue.push({ts: Date.now(), query: object, cb: cb});
      self.emitEvent('offlineQueuePush', {query: object, cb: cb});
    }
  }

  return self;
};

/**
 * Removes all listeners, either from a specific event or from all events
 *
 * @param {string} event - One of the event described in the Event Handling section of this documentation
 * @returns {Kuzzle} this object
 */
Kuzzle.prototype.removeAllListeners = function (event) {
  var
    knownEvents = Object.keys(this.eventListeners),
    self = this;

  if (event) {
    if (knownEvents.indexOf(event) === -1) {
      throw new Error('[' + event + '] is not a known event. Known events: ' + knownEvents.toString());
    }

    this.eventListeners[event].listeners = [];
  } else {
    knownEvents.forEach(function (eventName) {
      self.eventListeners[eventName].listeners = [];
    });
  }

  return this;
};

/**
 * Removes a listener from an event.
 *
 * @param {string} event - One of the event described in the Event Handling section of this documentation
 * @param {string} listenerId - The ID returned by addListener
 * @returns {Kuzzle} this object
 */
Kuzzle.prototype.removeListener = function (event, listenerId) {
  var
    knownEvents = Object.keys(this.eventListeners),
    self = this;

  if (knownEvents.indexOf(event) === -1) {
    throw new Error('[' + event + '] is not a known event. Known events: ' + knownEvents.toString());
  }

  this.eventListeners[event].listeners.forEach(function (listener, index) {
    if (listener.id === listenerId) {
      self.eventListeners[event].listeners.splice(index, 1);
    }
  });

  return this;
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
 * Sets the default Kuzzle index
 *
 * @param index
 * @returns this
 */
Kuzzle.prototype.setDefaultIndex = function (index) {
  if (typeof index !== 'string') {
    throw new Error('Invalid default index: [' + index + '] (an index name is expected)');
  }

  if (index.length === 0) {
    throw new Error('Cannot set an empty index as the default index');
  }

  this.defaultIndex = index;

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
Kuzzle.prototype.setHeaders = function (content, replace) {
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
