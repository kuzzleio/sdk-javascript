const
  uuidv4 = require('uuid/v4'),
  KuzzleEventEmitter = require('./eventEmitter'),
  Collection = require('./Collection.js'),
  Document = require('./Document.js'),
  Security = require('./security/Security'),
  MemoryStorage = require('./MemoryStorage'),
  User = require('./security/User'),
  Auth = require('./Auth.js'),
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
class Kuzzle extends KuzzleEventEmitter {
  constructor(host, options) {
    super();

    if (!host || host === '') {
      throw new Error('host argument missing');
    }

    Object.defineProperties(this, {
      // 'private' properties
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
      for (const opt of Object.keys(options)) {
        if (this.hasOwnProperty(opt) && Object.getOwnPropertyDescriptor(this, opt).writable) {
          this[opt] = options[opt];
        }
      }
    }

    // Forward the subscribe query to the network wrapper
    Object.defineProperty(this, 'subscribe', {
      value: function(room, opts, subscribeCB) {
        const
          object = {
            requestId: uuidv4(),
            controller: 'realtime',
            action: 'subscribe',
            index: room.collection.index,
            collection: room.collection.collection,
            volatile: this.volatile,
            body: room.filters,
            scope: room.scope,
            state: room.state,
            users: room.users
          },
          notificationCB = data => {
            if (data.type === 'TokenExpired') {
              this.unsetJwt();
              return this.emit('tokenExpired');
            }

            if (data.type === 'document') {
              const copy = Object.assign({}, data);
              copy.document = new Document(room.collection, data.result._id, data.result._source, data.result._meta);
              delete copy.result;
              return room.notify(copy);
            }

            room.notify(data);
          };

        if (this.jwt !== undefined) {
          object.jwt = this.jwt;
        }

        Object.assign(object.volatile, room.volatile, {sdkInstanceId: this.network.id, sdkVersion: this.sdkVersion});

        this.network.subscribe(object, opts, notificationCB, subscribeCB);
      }
    });

    // Forward the unsubscribe query to the network wrapper
    Object.defineProperty(this, 'unsubscribe', {
      value: (room, unsubscribeCB) => {
        const
          object = {
            requestId: uuidv4(),
            controller: 'realtime',
            action: 'unsubscribe',
            volatile: this.volatile,
            body: {roomId: room.roomId}
          };

        if (this.jwt !== undefined) {
          object.jwt = this.jwt;
        }

        Object.assign(object.volatile, room.volatile, {sdkInstanceId: this.network.id, sdkVersion: this.sdkVersion});

        this.network.unsubscribe(object, room.channel, unsubscribeCB);
      }
    });

    /**
     * Some methods (mainly read queries) require a callback function. This function exists to avoid repetition of code,
     * and is called by these methods
     */
    Object.defineProperty(this, 'callbackRequired', {
      value: (errorMessagePrefix, callback) => {
        if (!callback || typeof callback !== 'function') {
          throw new Error(`${errorMessagePrefix}: a callback argument is required for read queries`);
        }
      }
    });

    /**
    * Singletons for Kuzzle API
    */
    Object.defineProperty(this, 'auth', {
      value: new Auth(this),
      enumerable: true
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

    this.network = networkWrapper(this.protocol, host, options);

    // Properties related to the network layer
    // Accessing a property irrelevant for a given protocol
    // (e.g. "autoReconnect" for the HTTP layer) should
    // throw an exception
    Object.defineProperties(this, {
      autoQueue: {
        enumerable: true,
        get: () => this.network.autoQueue,
        set: value => {
          checkPropertyType('autoQueue', 'boolean', value);
          this.network.autoQueue = value;
        }
      },
      autoReconnect: {
        enumerable: true,
        get: () => this.network.autoReconnect
      },
      autoReplay: {
        enumerable: true,
        get: () => this.network.autoReplay,
        set: value => {
          checkPropertyType('autoReplay', 'boolean', value);
          this.network.autoReplay = value;
        }
      },
      host: {
        enumerable: true,
        get: () => this.network.host
      },
      offlineQueue: {
        enumerable: true,
        get: () => this.network.offlineQueue
      },
      offlineQueueLoader: {
        enumerable: true,
        get: () => this.network.offlineQueueLoader,
        set: value => {
          if (value !== null) {
            checkPropertyType('offlineQueueLoader', 'function', value);
          }
          this.network.offlineQueueLoader = value;
        }
      },
      port: {
        enumerable: true,
        get: () => this.network.port
      },
      queueFilter: {
        enumerable: true,
        get: () => this.network.queueFilter,
        set: value => {
          checkPropertyType('queueFilter', 'function', value);
          this.network.queueFilter = value;
        }
      },
      queueMaxSize: {
        enumerable: true,
        get: () => this.network.queueMaxSize,
        set: value => {
          checkPropertyType('queueMaxSize', 'number', value);
          this.network.queueMaxSize = value;
        }
      },
      queueTTL: {
        enumerable: true,
        get: () => this.network.queueTTL,
        set: value => {
          checkPropertyType('queueTTL', 'number', value);
          this.network.queueTTL = value;
        }
      },
      replayInterval: {
        enumerable: true,
        get: () => this.network.replayInterval,
        set: value => {
          checkPropertyType('replayInterval', 'number', value);
          this.network.replayInterval = value;
        }
      },
      reconnectionDelay: {
        enumerable: true,
        get: () => this.network.reconnectionDelay
      },
      sslConnection: {
        eumerable: true,
        get: () => this.network.ssl
      }
    });

    this.network.addListener('offlineQueuePush', data => this.emit('offlineQueuePush', data));
    this.network.addListener('offlineQueuePop', data => this.emit('offlineQueuePop', data));
    this.network.addListener('queryError', (err, query) => this.emit('queryError', err, query));

    this.network.addListener('tokenExpired', () => {
      this.unsetJwt();
      this.emit('tokenExpired');
    });

    if (this.bluebird) {
      return this.bluebird.promisifyAll(this, {
        suffix: 'Promise',
        filter: function (name, func, target, passes) {
          const whitelist = ['getAllStatistics', 'getServerInfo', 'getStatistics',
            'listCollections', 'listIndexes', 'login', 'logout', 'now', 'query',
            'checkToken', 'whoAmI', 'updateSelf', 'getMyRights', 'getMyCredentials',
            'createMyCredentials', 'deleteMyCredentials', 'updateMyCredentials', 'validateMyCredentials',
            'createIndex', 'refreshIndex', 'getAutoRefresh', 'setAutoRefresh', 'connect'
          ];

          return passes && whitelist.indexOf(name) !== -1;
        }
      });
    }
  }

  /**
  * Emit an event to all registered listeners
  * An event cannot be emitted multiple times before a timeout has been reached.
  */
  emit (eventName, ...payload) {
    const
      now = Date.now(),
      protectedEvent = this.protectedEvents[eventName];

    if (protectedEvent) {
      if (protectedEvent.lastEmitted && protectedEvent.lastEmitted > now - protectedEvent.timeout) {
        return false;
      }
      protectedEvent.lastEmitted = now;
    }

    super.emit(eventName, ...payload);
  }


  /**
   * Connects to a Kuzzle instance using the provided host name
   * @param {function} [cb] Connection callback
   */
  connect (cb) {
    if (this.network.isReady()) {
      if (cb) {
        cb(null, this);
      }
      return;
    }

    this.network.connect();

    this.network.addListener('connect', () => {
      this.emit('connected');

      if (cb) {
        cb(null, this);
      }
    });

    this.network.addListener('networkError', error => {
      const connectionError = new Error(`Unable to connect to kuzzle proxy server at ${this.network.host}:${this.network.port}`);

      connectionError.internal = error;
      this.emit('networkError', connectionError);

      if (cb) {
        cb(connectionError);
      }
    });

    this.network.addListener('disconnect', () => {
      for (const collection of Object.keys(this.collections)) {
        delete this.collections[collection];
      }

      this.emit('disconnected');
    });

    this.network.addListener('reconnect', () => {
      if (this.jwt) {
        this.checkToken(this.jwt, (err, res) => {
          // shouldn't obtain an error but let's invalidate the token anyway
          if (err || !res.valid) {
            this.unsetJwt();
          }

          this.emit('reconnected');
        });
      } else {
        this.emit('reconnected');
      }
    });

    this.network.on('discarded', data => this.emit('discarded', data));
  }

  /**
   * Set the jwt used to query kuzzle
   * @param token
   * @returns {Kuzzle}
   */
  setJwt (token) {
    if (typeof token === 'string') {
      this.jwt = token;
    } else if (typeof token === 'object') {
      if (token.result && token.result.jwt && typeof token.result.jwt === 'string') {
        this.jwt = token.result.jwt;
      } else {
        this.emit('loginAttempt', {
          success: false,
          error: 'Cannot find a valid JWT in the following object: ' + JSON.stringify(token)
        });

        return this;
      }
    } else {
      this.emit('loginAttempt', {success: false, error: 'Invalid token argument: ' + token});
      return this;
    }

    this.emit('loginAttempt', {success: true});
    return this;
  }

  /**
   * Unset the jwt used to query kuzzle
   * @returns {Kuzzle}
   */
  unsetJwt () {
    this.jwt = undefined;
    return this;
  }

  /**
   * Get the jwt used by kuzzle
   * @returns {Kuzzle}
   */
  getJwt () {
    return this.jwt;
  }

  /**
   * Create a kuzzle index
   *
   * @param {string} index
   * @param {object} [options]
   * @param {responseCallback} cb
   * @returns {Kuzzle}
   */
  createIndex (index, options, cb) {
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

    this.query({controller: 'index', action: 'create', index}, {}, options, (err, res) => {
      if (typeof cb === 'function') {
        cb(err, err ? undefined : res.result);
      }
    });

    return this;
  }

  /**
   * Adds a listener to a Kuzzle global event. When an event is fired, listeners are called in the order of their
   * insertion.
   *
   * @param {string} event - name of the global event to subscribe to
   * @param {function} listener - callback to invoke each time an event is fired
   */
  addListener (event, listener) {
    if (this.eventActions.indexOf(event) === -1) {
      throw new Error(`[${event}] is not a known event. Known events: ${this.eventActions.toString()}`);
    }

    return super.addListener(event, listener);
  }

  /**
   * Kuzzle monitors active connections, and ongoing/completed/failed requests.
   * This method returns all available statistics from Kuzzle.
   *
   * @param {object} [options] - Optional parameters
   * @param {responseCallback} cb - Handles the query response
   */
  getAllStatistics (options, cb) {
    if (!cb && typeof options === 'function') {
      cb = options;
      options = null;
    }

    this.callbackRequired('Kuzzle.getAllStatistics', cb);

    this.query({controller:'server', action: 'getAllStats'}, {}, options, (err, res) => {
      cb(err, err ? undefined : res.result.hits);
    });
  }

  /**
   * Kuzzle monitors active connections, and ongoing/completed/failed requests.
   * This method allows getting either the last statistics frame, or a set of frames starting from a provided timestamp.
   *
   * @param {number} startTime -  Epoch time. Starting time from which the frames are to be retrieved
   * @param {number} stopTime -  Epoch time. End time from which the frames are to be retrieved
   * @param {object} [options] - Optional parameters
   * @param {responseCallback} cb - Handles the query response
   */
  getStatistics (...args) {
    let
      startTime,
      stopTime,
      options,
      cb;

    switch (args.length) {
      case 1:
        cb = args[0];
        startTime = null;
        stopTime = null;
        options = null;
        break;
      case 2:
        if (typeof args[0] === 'object') {
          [options, cb] = args;
        } else {
          [startTime, cb] = args;
        }
        break;
      case 3:
        if (typeof args[1] === 'object') {
          [startTime, options, cb] = args;
        } else {
          [startTime, stopTime, cb] = args;
        }
        break;
      case 4:
        [startTime, stopTime, options, cb] = args;
        break;
      default:
        throw new Error('Bad arguments list. Usage: kuzzle.getStatistics([startTime,] [stopTime,] [options,] callback)');
    }

    this.callbackRequired('Kuzzle.getStatistics', cb);

    const queryCB = (err, res) => {
      if (err) {
        return cb(err);
      }

      cb(null, startTime ? res.result.hits : [res.result]);
    };

    let query = {};
    if (startTime) {
      query = stopTime ? {startTime, stopTime} : {startTime};
    }

    this.query({controller: 'server', action: startTime ? 'getStats' : 'getLastStats'}, query, options, queryCB);
  }

  /**
   * Create a new instance of a Collection object.
   * If no index is specified, takes the default index.
   *
   * @param {string} collection - The name of the data collection you want to manipulate
   * @param {string} [index] - The name of the data index containing the data collection
   * @returns {Collection} A Collection instance
   */
  collection (collection, index) {
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
  }

  /**
   * Empties the offline queue without replaying it.
   *
   * @returns {Kuzzle}
   */
  flushQueue () {
    this.network.flushQueue();
    return this;
  }

  /**
   * Returns the list of known persisted data collections.
   *
   * @param {string} [index] - Index containing collections to be listed
   * @param {object} [options] - Optional parameters
   * @param {responseCallback} cb - Handles the query response
   */
  listCollections (...args) {
    let
      index,
      options,
      cb;

    for (const arg of args) {
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
    }

    if (!index) {
      if (!this.defaultIndex) {
        throw new Error('Kuzzle.listCollections: index required');
      }

      index = this.defaultIndex;
    }

    this.callbackRequired('Kuzzle.listCollections', cb);

    const query = {type: options && options.type || 'all'};

    this.query({index, controller: 'collection', action: 'list'}, query, options, (err, res) => {
      cb(err, err ? undefined : res.result.collections);
    });
  }

  /**
   * Returns the list of existing indexes in Kuzzle
   *
   * @param {object} [options] - Optional arguments
   * @param {responseCallback} cb - Handles the query response
   */
  listIndexes (options, cb) {
    if (!cb && typeof options === 'function') {
      cb = options;
      options = null;
    }

    this.callbackRequired('Kuzzle.listIndexes', cb);

    this.query({controller: 'index', action: 'list'}, {}, options, (err, res) => {
      cb(err, err ? undefined : res.result.indexes);
    });
  }

  /**
   * Disconnects from Kuzzle and invalidate this instance.
   */
  disconnect () {
    this.network.close();

    for (const collection of Object.keys(this.collections)) {
      delete this.collections[collection];
    }
  }

  /**
   * Returns the server informations
   *
   * @param {object} [options] - Optional arguments
   * @param {responseCallback} cb - Handles the query response
   */
  getServerInfo (options, cb) {
    if (!cb && typeof options === 'function') {
      cb = options;
      options = null;
    }

    this.callbackRequired('Kuzzle.getServerInfo', cb);

    this.query({controller: 'server', action: 'info'}, {}, options, (err, res) => {
      cb(err, err ? undefined : res.result.serverInfo);
    });
  }

  /**
   * Forces an index refresh
   *
   * @param {string} index - The index to refresh. Defaults to Kuzzle.defaultIndex
   * @param {object} options - Optional arguments
   * @param {responseCallback} cb - Handles the query response
   * @returns {Kuzzle}
   */
  refreshIndex (...args) {
    let
      index,
      options,
      cb;

    for (const arg of args) {
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
    }

    if (!index) {
      if (!this.defaultIndex) {
        throw new Error('Kuzzle.refreshIndex: index required');
      }
      index = this.defaultIndex;
    }

    this.query({index, controller: 'index', action: 'refresh'}, {}, options, cb);

    return this;
  }

  /**
   * Returns de current autoRefresh status for the given index
   *
   * @param {string} index - The index to get the status from. Defaults to Kuzzle.defaultIndex
   * @param {object} options - Optinal arguments
   * @param {responseCallback} cb - Handles the query response
   */
  getAutoRefresh (...args) {
    let
      index,
      options,
      cb;

    for (const arg of args) {
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
    }

    if (!index) {
      if (!this.defaultIndex) {
        throw new Error('Kuzzle.getAutoRefresh: index required');
      }
      index = this.defaultIndex;
    }

    this.callbackRequired('Kuzzle.getAutoRefresh', cb);
    this.query({index, controller: 'index', action: 'getAutoRefresh'}, {}, options, cb);
  }

  /**
   * (Un)Sets the autoRefresh flag on the given index
   *
   * @param {string} index - the index to modify. Defaults to Kuzzle.defaultIndex
   * @param {boolean} autoRefresh - The autoRefresh value to set
   * @param {object} options - Optional arguments
   * @param {responseCallback} cb - Handles the query result
   * @returns {object} this
   */
  setAutoRefresh (...args) {
    var
      index,
      autoRefresh,
      options,
      cb;

    for (const arg of args) {
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
    }

    if (!index) {
      if (!this.defaultIndex) {
        throw new Error('Kuzzle.setAutoRefresh: index required');
      }
      index = this.defaultIndex;
    }

    if (autoRefresh === undefined) {
      throw new Error('Kuzzle.setAutoRefresh: autoRefresh value is required');
    }

    this.query({index, controller: 'index', action: 'setAutoRefresh'}, {body: {autoRefresh}}, options, cb);

    return this;
  }

  /**
   * Return the current Kuzzle's UTC Epoch time, in milliseconds
   * @param {object} [options] - Optional parameters
   * @param {responseCallback} cb - Handles the query response
   */
  now (options, cb) {
    if (!cb && typeof options === 'function') {
      cb = options;
      options = null;
    }

    this.callbackRequired('Kuzzle.now', cb);

    this.query({controller: 'server', action: 'now'}, {}, options, (err, res) => {
      cb(err, err ? undefined : res.result.now);
    });
  }

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
  query (queryArgs, query = {}, options = null) {
    const
      object = {
        action: queryArgs.action,
        controller: queryArgs.controller,
        volatile: this.volatile
      };

    if (options) {
      for (const prop of ['refresh', 'from', 'size', 'scroll', 'scrollId']) {
        if (options[prop] !== undefined) {
          object[prop] = options[prop];
        }
      }

      if (options.volatile && typeof options.volatile === 'object') {
        Object.assign(object.volatile, options.volatile);
      }
    }

    if (!query || typeof query !== 'object' || Array.isArray(query)) {
      return Promise.reject(Error(`Invalid query parameter: ${JSON.stringify(query)}`));
    }

    Object.assign(object.volatile, query.volatile, {
      sdkInstanceId: this.network.id,
      sdkVersion: this.sdkVersion
    });

    for (const attr of Object.keys(query)) {
      if (attr !== 'volatile') {
        object[attr] = query[attr];
      }
    }

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

    return this.network.query(object, options)
      .then(response => response.result);
  }

  /**
   * Starts the requests queuing.
   */
  startQueuing () {
    this.network.startQueuing();
    return this;
  }

  /**
   * Stops the requests queuing.
   */
  stopQueuing () {
    this.network.stopQueuing();
    return this;
  }

  /**
   * @DEPRECATED
   * See Kuzzle.prototype.playQueue();
   */
  replayQueue () {
    return this.playQueue();
  }

  /**
   * Plays the requests queued during offline mode.
   */
  playQueue () {
    this.network.playQueue();
    return this;
  }

  /**
   * Sets the default Kuzzle index
   *
   * @param index
   * @returns this
   */
  setDefaultIndex (index) {
    if (typeof index !== 'string') {
      throw new Error(`Invalid default index: [${index}] (an index name is expected)`);
    }

    if (index.length === 0) {
      throw new Error('Cannot set an empty index as the default index');
    }

    this.defaultIndex = index;

    return this;
  }
}

function checkPropertyType(prop, typestr, value) {
  const wrongType = typestr === 'array' ? !Array.isArray(value) : typeof value !== typestr;

  if (wrongType) {
    throw new Error(`Can only assign a ${typestr} value to property "${prop}"`);
  }
}

module.exports = Kuzzle;
