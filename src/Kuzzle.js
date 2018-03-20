const
  uuidv4 = require('uuid/v4'),
  KuzzleEventEmitter = require('./eventEmitter'),
  CollectionController = require('./controllers/collection'),
  DocumentController = require('./controllers/document'),
  IndexController = require('./controllers/index'),
  RealtimeController = require('./controllers/realtime'),
  ServerController = require('./controllers/server'),
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
      },
      collection: {
        value: new CollectionController(this),
        enumerable: true
      },
      document: {
        value: new DocumentController(this),
        enumerable: true
      },
      index: {
        value: new IndexController(this),
        enumerable: true
      },
      realtime: {
        value: new RealtimeController(this),
        enumerable: true
      },
      server: {
        value: new ServerController(this),
        enumerable: true
      }
    });

    if (options) {
      for (const opt of Object.keys(options)) {
        if (this.hasOwnProperty(opt) && Object.getOwnPropertyDescriptor(this, opt).writable) {
          this[opt] = options[opt];
        }
      }
    }

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

    Object.defineProperty(this, 'collections', {
      value: {},
      writable: true
    });

    Object.defineProperty(this, 'eventTimeout', {
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
        throw new Error('Cannot find a valid JWT in the following object: ' + JSON.stringify(token));
      }
    } else {
      throw new Error('Invalid token argument: ' + token);
    }

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
   * Empties the offline queue without replaying it.
   *
   * @returns {Kuzzle}
   */
  flushQueue () {
    this.network.flushQueue();
    return this;
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
  query (request = {}, options = {}) {
    if (!request || typeof request !== 'object' || Array.isArray(request)) {
      return Promise.reject(new Error(`Invalid request: ${JSON.stringify(request)}`));
    }

    // we follow the api but allow some more logical "mistakes"
    if (request.options) {
      request.options = 'wait_for';
    }

    if (!request.volatile) {
      request.volatile = {};
    }
    if (!request.volatile || typeof request.volatile !== 'object' || Array.isArray(request.volatile)) {
      return Promise.reject(new Error('Invalid volatile argument received. Must be an object.'));
    }
    request.volatile.sdkInstanceId= this.network.id;
    request.volatile.sdkVersion = this.sdkVersion;

    /*
     * Do not add the token for the checkToken route, to avoid getting a token error when
     * a developer simply wish to verify his token
     */
    if (this.jwt !== undefined
      && request.controller !== 'auth'
      && request.action !== 'checkToken'
    ) {
      request.jwt = this.jwt;
    }

    return this.network.query(request, options)
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
