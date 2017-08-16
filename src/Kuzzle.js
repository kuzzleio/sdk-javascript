var
  uuidv4 = require('uuid/v4'),
  KuzzleEventEmitter = require('./eventEmitter'),
  Collection = require('./Collection.js'),
  Document = require('./Document.js'),
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
    connectCB: {
      value: cb
    },
    eventActions: {
      value: [
        'connected',
        'discarded',
        'disconnected',
        'loginAttempt',
        'networkError',
        'offlineQueuePush',
        'offlineQueuePop',
        'queryError',
        'reconnected',
        'tokenExpired'
      ]
    },
    // configuration properties
    autoResubscribe: {
      value: options && typeof options.autoResubscribe === 'boolean' ? options.autoResubscribe : true,
      enumerable: true
    },
    defaultIndex: {
      value: (options && typeof options.defaultIndex === 'string') ? options.defaultIndex : undefined,
      writable: true,
      enumerable: true
    },
    headers: {
      value: {},
      enumerable: true,
      writable: true
    },
    jwt: {
      value: undefined,
      enumerable: true,
      writable: true
    },
    protocol: {
      value: (options && typeof options.protocol === 'string') ? options.protocol : 'websocket',
      enumerable: true
    },
    sdkVersion: {
      value: (typeof SDKVERSION === 'undefined') ? require('../package.json').version : SDKVERSION
    },
    volatile: {
      value: {},
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
  }

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

  // Forward the subscribe query to the network wrapper
  Object.defineProperty(this, 'subscribe', {
    value: function(room, opts, subscribeCB) {
      var
        object = {
          requestId: uuidv4(),
          controller: 'realtime',
          action: 'subscribe',
          index: room.collection.index,
          collection: room.collection.collection,
          headers: room.headers,
          volatile: this.volatile,
          body: room.filters,
          scope: room.scope,
          state: room.state,
          users: room.users
        },
        notificationCB = function(data) {
          if (data.type === 'TokenExpired') {
            return self.unsetJwt();
          }
          if (data.type === 'document') {
            data.document = new Document(room.collection, data.result._id, data.result._source, data.result._meta);
            delete data.result;
          }
          data.fromSelf = self.requestHistory[data.requestId] !== undefined;
          room.notify(data);
        };

      if (this.jwt !== undefined) {
        object.jwt = this.jwt;
      }

      if (room.volatile) {
        Object.keys(room.volatile).forEach(function (meta) {
          object.volatile[meta] = room.volatile[meta];
        });
      }
      object.volatile.sdkVersion = this.sdkVersion;

      object = this.addHeaders(object, this.headers);

      this.network.subscribe(object, opts, notificationCB, subscribeCB);
    }
  });

  // Forward the unsubscribe query to the network wrapper
  Object.defineProperty(this, 'unsubscribe', {
    value: function(room, opts, unsubscribeCB) {
      var
        object = {
          requestId: uuidv4(),
          controller: 'realtime',
          action: 'unsubscribe',
          volatile: this.volatile,
          headers: room.headers,
          body: {roomId: room.roomId}
        };

      if (this.jwt !== undefined) {
        object.jwt = this.jwt;
      }

      if (room.volatile) {
        Object.keys(room.volatile).forEach(function (meta) {
          object.volatile[meta] = room.volatile[meta];
        });
      }
      object.volatile.sdkVersion = this.sdkVersion;

      object = this.addHeaders(object, this.headers);

      this.network.unsubscribe(object, opts, room, unsubscribeCB);
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

  Object.defineProperty(this, 'collections',{
    value: {},
    writable: true
  });

  Object.defineProperty(this, 'eventTimeout',{
    value: options && typeof options.eventTimeout === 'number' ? options.eventTimeout : 200
  });

  Object.defineProperty(this, 'protectedEvents', {
    value: {
      connected: {timeout: this.eventTimeout},
      error: {timeout: this.eventTimeout},
      disconnected: {timeout: this.eventTimeout},
      reconnected: {timeout: this.eventTimeout},
      tokenExpired: {timeout: this.eventTimeout},
      loginAttempt: {timeout: this.eventTimeout}
    }
  });

  Object.defineProperty(this, 'requestHistory', {
    value: {},
    writable: true
  });

  this.network = networkWrapper(this.protocol, host, options);

  this.network.addListener('offlineQueuePush', function(data) {
    self.emitEvent('offlineQueuePush', data);
  });

  this.network.addListener('offlineQueuePop', function(data) {
    self.emitEvent('offlineQueuePop', data);
  });

  this.network.addListener('queryError', function(err, query) {
    self.emitEvent('queryError', err, query);
  });

  this.network.addListener('tokenExpired', function() {
    self.unsetJwt();
  });

  if ((options && options.connect || 'auto') === 'auto') {
    this.connect();
  }

  this.network.addListener('emitRequest', function(request) {
    self.requestHistory[request.requestId] = Date.now();
  });

  cleanHistory(this.requestHistory);

  if (this.bluebird) {
    return this.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['getAllStatistics', 'getServerInfo', 'getStatistics',
          'listCollections', 'listIndexes', 'login', 'logout', 'now', 'query',
          'checkToken', 'whoAmI', 'updateSelf', 'getMyRights', 'getMyCredentials',
          'createMyCredentials', 'deleteMyCredentials', 'updateMyCredentials', 'validateMyCredentials',
          'createIndex', 'refreshIndex', 'getAutoRefresh', 'setAutoRefresh'
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

  if (this.network.state !== 'offline') {
    if (this.connectCB) {
      this.connectCB(null, self);
    }
    return self;
  }

  this.network.connect();

  this.network.addListener('connect', function () {
    self.emitEvent('connected');

    if (self.connectCB) {
      self.connectCB(null, self);
    }
  });

  this.network.addListener('networkError', function (error) {
    var connectionError = new Error('Unable to connect to kuzzle proxy server at "' + self.network.host + ':' + self.network.port + '"');

    connectionError.internal = error;
    self.emitEvent('networkError', connectionError);

    if (self.connectCB) {
      self.connectCB(connectionError);
    }
  });

  this.network.addListener('disconnect', function () {
    self.disconnect();
    self.emitEvent('disconnected');
  });

  this.network.addListener('reconnect', function () {
    if (self.jwt) {
      self.checkToken(self.jwt, function (err, res) {
        // shouldn't obtain an error but let's invalidate the token anyway
        if (err || !res.valid) {
          self.unsetJwt();
        }

        self.emitEvent('reconnected');
      });
    } else {
      self.emitEvent('reconnected');
    }
  });

  this.network.on('discarded', function (data) {
    self.emitEvent('discarded', data);
  });

  return this;
};

/**
 * Set the jwt used to query kuzzle
 * @param token
 * @returns {Kuzzle}
 */
Kuzzle.prototype.setJwt = function(token) {
  if (typeof token === 'string') {
    this.jwt = token;
  } else if (typeof token === 'object') {
    if (token.result && token.result.jwt && typeof token.result.jwt === 'string') {
      this.jwt = token.result.jwt;
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

  this.emitEvent('loginAttempt', {success: true});
  return this;
};

/**
 * Unset the jwt used to query kuzzle
 * @returns {Kuzzle}
 */
Kuzzle.prototype.unsetJwt = function() {
  this.jwt = undefined;
  this.emitEvent('tokenExpired');

  return this;
};

/**
 * Get the jwt used by kuzzle
 * @returns {Kuzzle}
 */
Kuzzle.prototype.getJwt = function() {
  return this.jwt;
};

/**
 * Send login request to kuzzle with credentials
 * If login success, store the jwt into kuzzle object
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
        self.setJwt(response.result.jwt);
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
 * Send logout request to kuzzle with jwt.
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

  self.unsetJwt();

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
 * Adds a listener to a Kuzzle global event. When an event is fired, listeners are called in the order of their
 * insertion.
 *
 * @param {string} event - name of the global event to subscribe to
 * @param {function} listener - callback to invoke each time an event is fired
 */
Kuzzle.prototype.addListener = function(event, listener) {
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
  this.network.flushQueue();
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

  this.network.close();

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
    };

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (options) {
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

  object = this.addHeaders(object, this.headers);

  /*
   * Do not add the token for the checkToken route, to avoid getting a token error when
   * a developer simply wish to verify his token
   */
  if (this.jwt !== undefined && !(object.controller === 'auth' && object.action === 'checkToken')) {
    object.jwt = this.jwt;
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

  this.network.query(object, options, cb);

  return this;
};

/**
 * Starts the requests queuing.
 */
Kuzzle.prototype.startQueuing = function () {
  this.network.startQueuing();
  return this;
};

/**
 * Stops the requests queuing.
 */
Kuzzle.prototype.stopQueuing = function () {
  this.network.stopQueuing();
  return this;
};

/**
 * @DEPRECATED
 * See Kuzzle.prototype.playQueue();
 */
Kuzzle.prototype.replayQueue = function () {
  return this.playQueue();
};

/**
 * Plays the requests queued during offline mode.
 */
Kuzzle.prototype.playQueue = function () {
  this.network.playQueue();
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

module.exports = Kuzzle;
