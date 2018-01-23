var
  uuidv4 = require('uuid/v4'),
  KuzzleEventEmitter = require('./eventEmitter'),
  Collection = require('./Collection.js'),
  Security = require('./security/Security'),
  MemoryStorage = require('./MemoryStorage'),
  User = require('./security/User'),
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
 */
function Kuzzle (host, options, cb) {
  var self = this;

  if (!(this instanceof Kuzzle)) {
    return new Kuzzle(host, options, cb);
  }
  KuzzleEventEmitter.call(this);

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (!host || host === '') {
    throw new Error('host argument missing');
  }

  Object.defineProperties(this, {
    // 'private' properties
    id: {
      value: uuidv4()
    },
    collections: {
      value: {},
      writable: true
    },
    connectCB: {
      value: cb
    },
    eventActions: {
      value: [
        'connected',
        'networkError',
        'disconnected',
        'reconnected',
        'tokenExpired',
        'loginAttempt',
        'offlineQueuePush',
        'offlineQueuePop',
        'queryError',
        'discarded'
      ],
      writable: false
    },
    queuing: {
      value: false,
      writable: true
    },
    state: {
      value: 'initializing',
      writable: true
    },
    subscriptions: {
      /*
       Contains the centralized subscription list in the following format:
          pending: {
            subscriptionUid_1: kuzzleRoomInstance_1,
            subscriptionUid_2: kuzzleRoomInstance_2,
            subscriptionUid_...: kuzzleRoomInstance_...
          },
          'roomId': {
            subscriptionUid_1: kuzzleRoomInstance_1,
            subscriptionUid_2: kuzzleRoomInstance_2,
            subscriptionUid_...: kuzzleRoomInstance_...
          }

       This was made to allow multiple subscriptions on the same set of filters, something that Kuzzle does not permit.
       This structure also allows renewing subscriptions after a connection loss
       */
      value: {
        pending: {}
      },
      writable: true
    },
    // configuration properties
    autoReconnect: {
      value: (options && typeof options.autoReconnect === 'boolean') ? options.autoReconnect : true,
      writable: true,
      enumerable: true
    },
    defaultIndex: {
      value: (options && typeof options.defaultIndex === 'string') ? options.defaultIndex : undefined,
      writable: true,
      enumerable: true
    },
    reconnectionDelay: {
      value: (options && typeof options.reconnectionDelay === 'number') ? options.reconnectionDelay : 1000,
      writable: true,
      enumerable: true
    },
    host: {
      value: host,
      writable: true,
      enumerable: true
    },
    port: {
      value: (options && typeof options.port === 'number') ? options.port : 7512,
      enumerable: true,
      writable: true
    },
    sslConnection: {
      value: (options && typeof options.sslConnection === 'boolean') ? options.sslConnection : false,
      writable: true,
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
    volatile: {
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
      value: undefined,
      enumerable: true,
      writable: true
    },
    sdkVersion: {
      value: (typeof SDKVERSION === 'undefined') ? require('../package.json').version : SDKVERSION,
      writable: false
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
    value: new Security(this),
    enumerable: true
  });

  Object.defineProperty(this, 'memoryStorage', {
    value: new MemoryStorage(this),
    enumerable: true
  });

  Object.defineProperties(this, {
    eventTimeout: {
      value: options && typeof options.eventTimeout === 'number' ? options.eventTimeout : 200,
      writeable: false
    }
  });

  Object.defineProperty(this, 'protectedEvents', {
    value: {
      connected: {timeout: this.eventTimeout},
      error: {timeout: this.eventTimeout},
      disconnected: {timeout: this.eventTimeout},
      reconnected: {timeout: this.eventTimeout},
      tokenExpired: {timeout: this.eventTimeout},
      loginAttempt: {timeout: this.eventTimeout}
    },
    writeable: false
  });

  if (!options || !options.connect || options.connect === 'auto') {
    this.connect();
  } else {
    this.state = 'ready';
  }

  if (this.bluebird) {
    return this.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['getAllStatistics', 'getServerInfo', 'getStatistics',
          'listCollections', 'createIndex', 'listIndexes', 'login', 'logout',
          'now', 'query', 'checkToken', 'whoAmI', 'updateSelf', 'getMyRights',
          'refreshIndex', 'getAutoRefresh', 'setAutoRefresh'
        ];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }
}
Kuzzle.prototype = Object.create(KuzzleEventEmitter.prototype);
Kuzzle.prototype.constructor = Kuzzle;

/**
* Emit an event to all registered listeners
* An event cannot be emitted multiple times before a timeout has been reached.
*/
Kuzzle.prototype.emit = function(eventName) {
  var
    now = Date.now(),
    protectedEvent = this.protectedEvents[eventName];

  if (protectedEvent) {
    if (protectedEvent.lastEmitted && protectedEvent.lastEmitted > now - protectedEvent.timeout) {
      return false;
    }
    protectedEvent.lastEmitted = now;
  }
  KuzzleEventEmitter.prototype.emit.apply(this, arguments);
};
Kuzzle.prototype.emitEvent = Kuzzle.prototype.emit;

/**
 * Connects to a Kuzzle instance using the provided host name.
 * @returns {Object} this
 */
Kuzzle.prototype.connect = function () {
  var self = this;

  if (self.network) {
    self.disconnect();
  }

  self.network = networkWrapper(self.host, self.port, self.sslConnection);

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

  self.network.on('discarded', function (data) {
    self.emitEvent('discarded', data);
  });

  self.network.onConnectError(function (error) {
    var connectionError = new Error('Unable to connect to kuzzle proxy server at "' + self.host + ':' + self.port + '"');

    connectionError.internal = error;
    self.state = 'error';
    self.emitEvent('networkError', connectionError);

    disableAllSubscriptions.call(self);

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
          self.emitEvent('tokenExpired');
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
      body: {},
      strategy: strategy
    },
    cb = null;

  if (!strategy || typeof strategy !== 'string') {
    throw new Error('Kuzzle.login: strategy required');
  }

  // Handle arguments (credentials, expiresIn, cb)
  if (arguments[1]) {
    if (typeof arguments[1] === 'object') {
      request.body = arguments[1];
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

  this.query({controller: 'auth', action: 'login'}, request, {queuable: false}, function(error, response) {
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
 * Create credentials of the specified <strategy> for the current user.
 *
 * @param credentials
 * @param strategy
 * @param options
 * @param cb
 * @returns {Kuzzle}
 */
Kuzzle.prototype.createMyCredentials = function (strategy, credentials, options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.query({controller: 'auth', action: 'createMyCredentials'}, {strategy: strategy, body: credentials}, options, function(err, res) {
    if (!err) {
      cb && cb(null, res.result._source);
    } else {
      cb && cb(err);
    }
  });

  return this;
};

/**
 * Delete credentials of the specified <strategy> for the current user.
 *
 * @param strategy
 * @param options
 * @param cb
 * @returns {Kuzzle}
 */
Kuzzle.prototype.deleteMyCredentials = function (strategy, options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.query({controller: 'auth', action: 'deleteMyCredentials'}, {strategy: strategy}, options, typeof cb !== 'function' ? null : function(err, res) {
    if (!err) {
      cb && cb(null, res.result);
    } else {
      cb && cb(err);
    }
  });

  return this;
};

/**
 * Get credential information of the specified <strategy> for the current user.
 *
 * @param strategy
 * @param options
 * @param cb
 */
Kuzzle.prototype.getMyCredentials = function (strategy, options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.query({controller: 'auth', action: 'getMyCredentials'}, {strategy: strategy}, options, typeof cb !== 'function' ? null : function(err, res) {
    if (!err) {
      cb && cb(null, res.result);
    } else {
      cb && cb(err);
    }
  });
};

/**
 * Update credentials of the specified <strategy> for the current user.
 *
 * @param strategy
 * @param credentals
 * @param options
 * @param cb
 * @returns {Kuzzle}
 */
Kuzzle.prototype.updateMyCredentials = function (strategy, credentials, options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.query({controller: 'auth', action: 'updateMyCredentials'}, {strategy: strategy, body: credentials}, options, typeof cb !== 'function' ? null : function(err, res) {
    if (!err) {
      cb && cb(null, res.result);
    } else {
      cb && cb(err);
    }
  });

  return this;
};

/**
 * Validate credentials of the specified <strategy> for the current user.
 *
 * @param strategy
 * @param credentials
 * @param options
 * @param cb
 */
Kuzzle.prototype.validateMyCredentials = function (strategy, credentials, options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.query({controller: 'auth', action: 'validateMyCredentials'}, {strategy: strategy, body: credentials}, options, typeof cb !== 'function' ? null : function(err, res) {
    if (!err) {
      cb && cb(null, res.result);
    } else {
      cb && cb(err);
    }
  });
};

/**
 * Create a kuzzle index
 *
 * @param {string} index
 * @param {object} [options]
 * @param {responseCallback} cb
 * @returns {Kuzzle}
 */
Kuzzle.prototype.createIndex = function (index, options, cb) {
  if (!index) {
    if (!this.defaultIndex) {
      throw new Error('Kuzzle.createIndex: index required');
    }
    index = this.defaultIndex;
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.query({controller: 'index', action: 'create', index: index}, {}, options, typeof cb !== 'function' ? null : function (err, res) {
    cb(err, err ? undefined : res.result);
  });

  return this;
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
      requestId: uuidv4(),
      body: {}
    };

  this.query({controller: 'auth', action: 'logout'}, request, {queuable: false}, typeof cb !== 'function' ? null : function(error) {
    cb(error, self);
  });

  self.unsetJwtToken();

  return self;
};

/**
 * Checks whether a given jwt token still represents a valid session in Kuzzle.
 *
 * @param  {string}   token     The jwt token to check
 * @param  {function} cb  The callback to be called when the response is
 *                              available. The signature is `function(error, response)`.
 */
Kuzzle.prototype.checkToken = function (token, cb) {
  var
    request = {
      body: {
        token: token
      }
    };

  this.callbackRequired('Kuzzle.checkToken', cb);

  this.query({controller: 'auth', action: 'checkToken'}, request, {queuable: false}, function (err, res) {
    cb(err, err ? undefined : res.result);
  });
};

/**
 * Fetches the current user.
 *
 * @param  {function} cb  The callback to be called when the response is
 *                              available. The signature is `function(error, response)`.
 */
Kuzzle.prototype.whoAmI = function (cb) {
  var self = this;

  self.callbackRequired('Kuzzle.whoAmI', cb);

  self.query({controller: 'auth', action: 'getCurrentUser'}, {}, {}, function (err, res) {
    cb(err, err ? undefined : new User(self.security, res.result._id, res.result._source, res.result._meta));
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
    cb(err, err ? undefined : res.result.hits);
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
        self.emitEvent('tokenExpired', request, cb);
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
 * @param {string} event - name of the global event to subscribe to
 * @param {function} listener - callback to invoke each time an event is fired
 */
Kuzzle.prototype.addListener = function(event, listener) {
  this.isValid();

  if (this.eventActions.indexOf(event) === -1) {
    throw new Error('[' + event + '] is not a known event. Known events: ' + this.eventActions.toString());
  }

  return KuzzleEventEmitter.prototype.addListener.call(this, event, listener);
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

  this.query({controller:'server', action: 'getAllStats'}, {}, options, function (err, res) {
    cb(err, err ? undefined : res.result.hits);
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
  this.query({controller: 'server', action: timestamp ? 'getStats' : 'getLastStats'}, body, options, queryCB);
};

/**
 * Create a new instance of a Collection object.
 * If no index is specified, takes the default index.
 *
 * @param {string} collection - The name of the data collection you want to manipulate
 * @param {string} [index] - The name of the data index containing the data collection
 * @returns {Collection} A Collection instance
 */
Kuzzle.prototype.collection = function(collection, index) {
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
    this.collections[index][collection] = new Collection(this, collection, index);
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

  query = {type: options && options.type || 'all'};

  this.query({index: index, controller: 'collection', action: 'list'}, query, options, function (err, res) {
    cb(err, err ? undefined : res.result.collections);
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

  this.query({controller: 'index', action: 'list'}, {}, options, function (err, res) {
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

  this.query({controller: 'server', action: 'info'}, {}, options, function (err, res) {
    cb(err, err ? undefined : res.result.serverInfo);
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

  this.query({ index: index, controller: 'index', action: 'refresh'}, {}, options, cb);

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
  this.query({ index: index, controller: 'index', action: 'getAutoRefresh'}, {}, options, cb);
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

  this.query({ index: index, controller: 'index', action: 'setAutoRefresh'}, { body: { autoRefresh: autoRefresh }}, options, cb);

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

  this.query({controller: 'server', action: 'now'}, {}, options, function (err, res) {
    cb(err, err ? undefined : res.result.now);
  });
};

/**
 * This is a low-level method, exposed to allow advanced SDK users to bypass high-level methods.
 * Base method used to send read queries to Kuzzle
 *
 * Takes an optional argument object with the following properties:
 *    - volatile (object, default: null):
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
      volatile: this.volatile
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

    if (typeof options.from !== 'undefined' && options.from !== null) {
      object.from = options.from;
    }

    if (options.size) {
      object.size = options.size;
    }

    if (options.scroll) {
      object.scroll = options.scroll;
    }

    if (options.scrollId) {
      object.scrollId = options.scrollId;
    }

    if (options.volatile) {
      Object.keys(options.volatile).forEach(function (meta) {
        object.volatile[meta] = options.volatile[meta];
      });
    }
  }

  if (!query || typeof query !== 'object' || Array.isArray(query)) {
    throw new Error('Invalid query parameter: ' + query);
  }

  if (query.volatile) {
    Object.keys(query.volatile).forEach(function (meta) {
      object.volatile[meta] = query.volatile[meta];
    });
  }

  for (attr in query) {
    if (attr !== 'volatile' && query.hasOwnProperty(attr)) {
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
    object.requestId = uuidv4();
  }

  object.volatile.sdkVersion = this.sdkVersion;
  object.volatile.sdkInstanceId = this.id;

  if (self.state === 'connected' || (options && options.queuable === false)) {
    if (self.state === 'connected') {
      emitRequest.call(this, object, cb);
    } else {
      discardRequest(object, cb);
    }
  } else if (self.queuing || (options && options.queuable === true) || ['initializing', 'connecting'].indexOf(self.state) !== -1) {
    cleanQueue.call(this, object, cb);
    if (!self.queueFilter || self.queueFilter(object)) {
      self.offlineQueue.push({ts: Date.now(), query: object, cb: cb});
      self.emitEvent('offlineQueuePush', {query: object, cb: cb});
    } else {
      discardRequest(object, cb);
    }
  }
  else {
    discardRequest(object, cb);
  }

  return self;
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

function discardRequest(object, cb) {
  if (cb) {
    cb(new Error('Unable to execute request: not connected to a Kuzzle server.\nDiscarded request: ' + JSON.stringify(object)));
  }
}

function disableAllSubscriptions() {
  var self = this;

  Object.keys(self.subscriptions).forEach(function (roomId) {
    Object.keys(self.subscriptions[roomId]).forEach(function (subscriptionId) {
      var subscription = self.subscriptions[roomId][subscriptionId];
      subscription.subscribing = false;
    });
  });
}

module.exports = Kuzzle;
