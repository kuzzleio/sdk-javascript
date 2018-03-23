const
  KuzzleEventEmitter = require('./eventEmitter'),
  AuthController = require('./controllers/auth'),
  CollectionController = require('./controllers/collection'),
  DocumentController = require('./controllers/document'),
  IndexController = require('./controllers/index'),
  RealtimeController = require('./controllers/realtime'),
  ServerController = require('./controllers/server'),
  SecurityController = require('./controllers/security'),
  MemoryStorageController = require('./controllers/memoryStorage'),
  networkWrapper = require('./networkWrapper'),
  uuidv4 = require('./uuidv4');

const
  events = [
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
  ],
  protectedEvents = {
    connected: {},
    error: {},
    disconnected: {},
    reconnected: {},
    tokenExpired: {},
    loginAttempt: {}
  };

let
  _autoResubscribe,
  _eventTimeout,
  _jwt,
  _protocol,
  _version,
  _auth,
  _collection,
  _document,
  _index,
  _ms,
  _realtime,
  _security,
  _server;

class Kuzzle extends KuzzleEventEmitter {

  /**
   * @param host - Server name or IP Address to the Kuzzle instance
   * @param [options] - Connection options
   */
  constructor(host, options = {}) {
    super();

    if (!host || host === '') {
      throw new Error('host argument missing');
    }

    _autoResubscribe = typeof options.autoResubscribe === 'boolean' ? options.autoResubscribe : true;
    _eventTimeout = typeof options.eventTimeout === 'number' ? options.eventTimeout : 200;
    _protocol = typeof options.protocol === 'string' ? options.protocol : 'websocket';
    _version = typeof SDKVERSION === 'undefined' ? require('../package').version : SDKVERSION;

    // controllers
    _auth = new AuthController(this);
    _collection = new CollectionController(this);
    _document = new DocumentController(this);
    _index = new IndexController(this);
    _ms = new MemoryStorageController(this);
    _realtime = new RealtimeController(this);
    _security = new SecurityController(this);
    _server = new ServerController(this);

    this.defaultIndex = typeof options.defaultIndex === 'string' ? options.defaultIndex : undefined;
    this.network = networkWrapper(this.protocol, host, options);
    this.volatile = {};

    if (options) {
      for (const opt of Object.keys(options)) {
        if (this.hasOwnProperty(opt) && Object.getOwnPropertyDescriptor(this, opt).writable) {
          this[opt] = options[opt];
        }
      }
    }

    this.network.addListener('offlineQueuePush', data => this.emit('offlineQueuePush', data));
    this.network.addListener('offlineQueuePop', data => this.emit('offlineQueuePop', data));
    this.network.addListener('queryError', (err, query) => this.emit('queryError', err, query));

    this.network.addListener('tokenExpired', () => {
      this.jwt = undefined;
      this.emit('tokenExpired');
    });
  }

  get auth () {
    return _auth;
  }

  get autoQueue () {
    return this.network.autoQueue;
  }

  set autoQueue (value) {
    this._checkPropertyType('autoQueue', 'boolean', value);
    this.network.autoQueue = value;
  }

  get autoReconnect () {
    return this.network.autoReconnect;
  }

  set autoReconnect (value) {
    this._checkPropertyType('autoReconnect', 'boolean', value);
    this.network.autoReconnect = value;
  }

  get autoReplay () {
    return this.network.autoReplay;
  }

  set autoReplay (value) {
    this._checkPropertyType('autoReplay', 'boolean', value);
    this.network.autoReplay = value;
  }

  get autoResubscribe () {
    return _autoResubscribe;
  }

  get collection () {
    return _collection;
  }

  get document () {
    return _document;
  }

  get eventTimeout () {
    return _eventTimeout;
  }

  get index () {
    return _index;
  }

  get jwt () {
    return _jwt;
  }

  set jwt (token) {
    if (token === undefined) {
      _jwt = undefined;
    }
    else if (typeof token === 'string') {
      _jwt = token;
    }
    else if (typeof token === 'object'
      && token.result
      && token.result.jwt
      && typeof token.result.jwt === 'string'
    ) {
      _jwt = token.result.jwt;
    }

    throw new Error(`Invalid token argument: ${token}`);
  }

  get host () {
    return this.network.host;
  }

  get ms () {
    return _ms;
  }

  get offlineQueue () {
    return this.network.offlineQueue;
  }

  get offlineQueueLoader () {
    return this.network.offlineQueueLoader;
  }

  set offlineQueueLoader (value) {
    this._checkPropertyType('offlineQueueLoader', 'function', value);
    this.network.offlineQueueLoader = value;
  }

  get port () {
    return this.network.port;
  }

  get protocol () {
    return _protocol;
  }

  get queueFilter () {
    return this.network.queueFilter;
  }

  set queueFilter (value) {
    this._checkPropertyType('queueFilter', 'function', value);
    this.network.queueFilter = value;
  }

  get queueMaxSize () {
    return this.network.queuMaxSize();
  }

  set queueMaxSize (value) {
    this._checkPropertyType('queueMaxSize');
    this.network.queueMaxSize = value;
  }

  get queueTTL () {
    return this.network.queueTTL;
  }

  set queueTTL (value) {
    this._checkPropertyType('queueTTL', 'number', value);
    this.network.queueTTL = value;
  }

  get realtime () {
    return _realtime;
  }

  get reconnectionDelay () {
    return this.network.reconnectionDelay;
  }

  get replayInterval () {
    return this.network.replayInterval;
  }

  set replayInterval (value) {
    this._checkPropertyType('replayInterval', 'number', value);
    this.network.replayInterval = value;
  }

  get security () {
    return _security;
  }

  get server () {
    return _server;
  }

  get sslConnection () {
    return this.network.sslConnection;
  }

  get version () {
    return _version;
  }

  /**
  * Emit an event to all registered listeners
  * An event cannot be emitted multiple times before a timeout has been reached.
  */
  emit (eventName, ...payload) {
    const
      now = Date.now(),
      protectedEvent = protectedEvents[eventName];

    if (protectedEvent) {
      if (protectedEvent.lastEmitted && protectedEvent.lastEmitted > now - this.eventTimeout) {
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
  connect () {
    if (this.network.isReady()) {
      return Promise.resolve(this);
    }

    this.network.addListener('connect', () => {
      this.emit('connected');
    });

    this.network.addListener('networkError', error => {
      const connectionError = new Error(`Unable to connect to kuzzle proxy server at ${this.network.host}:${this.network.port}`);

      connectionError.internal = error;
      this.emit('networkError', connectionError);
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
            this.jwt = undefined;
          }

          this.emit('reconnected');
        });
      } else {
        this.emit('reconnected');
      }
    });

    this.network.on('discarded', data => this.emit('discarded', data));

    return this.network.connect();
  }

  /**
   * Adds a listener to a Kuzzle global event. When an event is fired, listeners are called in the order of their
   * insertion.
   *
   * @param {string} event - name of the global event to subscribe to
   * @param {function} listener - callback to invoke each time an event is fired
   */
  addListener (event, listener) {
    if (events.indexOf(event) === -1) {
      throw new Error(`[${event}] is not a known event. Known events: ${events.toString()}`);
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
   * @param {object} request
   * @param {object} [options] - Optional arguments
   * @returns {Promise<object>}
   */
  query (request = {}, options = {}) {
    if (!request || typeof request !== 'object' || Array.isArray(request)) {
      return Promise.reject(new Error(`Invalid request: ${JSON.stringify(request)}`));
    }

    if (!request.requestId) {
      request.requestId = uuidv4();
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

  _checkPropertyType (prop, typestr, value) {
    const wrongType = typestr === 'array' ? !Array.isArray(value) : typeof value !== typestr;

    if (wrongType) {
      throw new Error(`Expected ${prop} to be a ${typestr}, ${typeof value} received`);
    }
  }
}


for (const prop of ['autoResubscribe']) {
  Object.defineProperty(Kuzzle.prototype, prop, {enumerable: true});
}

module.exports = Kuzzle;
