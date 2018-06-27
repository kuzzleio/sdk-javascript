const
  KuzzleEventEmitter = require('./eventEmitter'),
  AuthController = require('./controllers/auth'),
  BulkController = require('./controllers/bulk'),
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
  ];

class Kuzzle extends KuzzleEventEmitter {

  /**
   * @param network - the network wrapper to use. if the argument is a string, creates an embeed network wrapper if a
   * @param [options] - Connection options
   */
  constructor(network, options = {}) {
    super();

    if (network === undefined || network === null) {
      throw new Error('"network" argument missing');
    }

    // embedded network protocol (http/websocket/socketio):
    if (typeof network === 'string') {
      return new Kuzzle(networkWrapper(network, options), options);
    }

    // custom protocol: check the existence of required methods
    for (const method of ['addListener', 'isReady', 'query']) {
      if (typeof network[method] !== 'function') {
        throw new Error(`Network instance must implement a "${method}" method`);
      }
    }
    this.network = network;

    this._protectedEvents = {
      connected: {},
      error: {},
      disconnected: {},
      reconnected: {},
      tokenExpired: {},
      loginAttempt: {}
    };

    this.autoResubscribe = typeof options.autoResubscribe === 'boolean' ? options.autoResubscribe : true;
    this.eventTimeout = typeof options.eventTimeout === 'number' ? options.eventTimeout : 200;
    this.sdkVersion = typeof SDKVERSION === 'undefined' ? require('../package').version : SDKVERSION;
    this.volatile = typeof options.volatile === 'object' ? options.volatile : {};

    // controllers
    this.auth = new AuthController(this);
    this.bulk = new BulkController(this);
    this.collection = new CollectionController(this);
    this.document = new DocumentController(this);
    this.index = new IndexController(this);
    this.ms = new MemoryStorageController(this);
    this.realtime = new RealtimeController(this);
    this.security = new SecurityController(this);
    this.server = new ServerController(this);

    this.network.addListener('offlineQueuePush', data => this.emit('offlineQueuePush', data));
    this.network.addListener('offlineQueuePop', data => this.emit('offlineQueuePop', data));
    this.network.addListener('queryError', (err, query) => this.emit('queryError', err, query));

    this.network.addListener('tokenExpired', () => {
      this.jwt = undefined;
      this.emit('tokenExpired');
    });
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

  get jwt () {
    return this._jwt;
  }

  set jwt (token) {
    if (token === undefined || token === null) {
      this._jwt = undefined;
    }
    else if (typeof token === 'string') {
      this._jwt = token;
    }
    else if (typeof token === 'object'
      && token.result
      && token.result.jwt
      && typeof token.result.jwt === 'string'
    ) {
      this._jwt = token.result.jwt;
    } else {
      throw new Error(`Invalid token argument: ${token}`);
    }
  }

  get host () {
    return this.network.host;
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

  get queueFilter () {
    return this.network.queueFilter;
  }

  set queueFilter (value) {
    this._checkPropertyType('queueFilter', 'function', value);
    this.network.queueFilter = value;
  }

  get queueMaxSize () {
    return this.network.queueMaxSize;
  }

  set queueMaxSize (value) {
    this._checkPropertyType('queueMaxSize', 'number', value);
    this.network.queueMaxSize = value;
  }

  get queueTTL () {
    return this.network.queueTTL;
  }

  set queueTTL (value) {
    this._checkPropertyType('queueTTL', 'number', value);
    this.network.queueTTL = value;
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

  get sslConnection () {
    return this.network.sslConnection;
  }

  /**
  * Emit an event to all registered listeners
  * An event cannot be emitted multiple times before a timeout has been reached.
  */
  emit (eventName, ...payload) {
    const
      now = Date.now(),
      protectedEvent = this._protectedEvents[eventName];

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
   * @returns {Promise<Object>}
   */
  connect () {
    if (this.network.isReady()) {
      return Promise.resolve();
    }

    this.network.addListener('connect', () => {
      this.emit('connected');
    });

    this.network.addListener('networkError', error => {
      this.emit('networkError', error);
    });

    this.network.addListener('disconnect', () => {
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

    this.network.addListener('discarded', data => this.emit('discarded', data));

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
    if (typeof request !== 'object' || Array.isArray(request)) {
      throw new Error(`Kuzzle.query: Invalid request: ${JSON.stringify(request)}`);
    }

    if (typeof options !== 'object' || Array.isArray(options)) {
      throw new Error(`Kuzzle.query: Invalid "options" argument: ${JSON.stringify(options)}`);
    }

    if (!request.requestId) {
      request.requestId = uuidv4();
    }

    // we follow the api but allow some more logical "mistakes" (the only allowed value for refresh arg is "wait_for")
    if (request.refresh) {
      request.refresh = 'wait_for';
    }

    if (!request.volatile) {
      request.volatile = this.volatile;
    } else if (typeof request.volatile !== 'object' || Array.isArray(request.volatile)) {
      throw new Error(`Kuzzle.query: Invalid volatile argument received: ${JSON.stringify(request.volatile)}`);
    }
    for (const item of Object.keys(this.volatile)) {
      if (request.volatile[item] === undefined) {
        request.volatile[item] = this.volatile[item];
      }
    }
    request.volatile.sdkInstanceId = this.network.id;
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

  _checkPropertyType (prop, typestr, value) {
    const wrongType = typestr === 'array' ? !Array.isArray(value) : typeof value !== typestr;

    if (wrongType) {
      throw new Error(`Expected ${prop} to be a ${typestr}, ${typeof value} received`);
    }
  }
}


for (const prop of [
  'autoQueue',
  'autoReconnect',
  'autoReplay',
  'jwt',
  'host',
  'offlineQueue',
  'offlineQueueLoader',
  'port',
  'queueFilter',
  'queueMaxSize',
  'queueTTL',
  'reconnectionDelay',
  'replayInterval',
  'sslConnection'
]) {
  Object.defineProperty(Kuzzle.prototype, prop, {enumerable: true});
}

module.exports = Kuzzle;
