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
  BaseController = require('./controllers/base'),
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
   * @param protocol - the protocol to use
   * @param [options] - Kuzzle options
   */
  constructor(protocol, options = {}) {
    super();

    if (protocol === undefined || protocol === null) {
      throw new Error('"protocol" argument missing');
    }

    // check the existence of required methods
    for (const method of ['addListener', 'isReady', 'query']) {
      if (typeof protocol[method] !== 'function') {
        throw new Error(`Protocol instance must implement a "${method}" method`);
      }
    }
    this.protocol = protocol;

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

    // offline queue
    this._autoQueue = typeof options.autoQueue === 'boolean' ? options.autoQueue : false;
    this._autoReplay = typeof options.autoReplay === 'boolean' ? options.autoReplay : false;
    this._offlineQueue = [];
    this._offlineQueueLoader = typeof options.offlineQueueLoader === 'function' ? options.offlineQueueLoader : null;
    this._queueFilter = typeof options.queueFilter === 'function' ? options.queueFilter : null;
    this._queueMaxSize = typeof options.queueMaxSize === 'number' ? options.queueMaxSize : 500;
    this._queueTTL = typeof options.queueTTL === 'number' ? options.queueTTL : 120000;

    if (options.offlineMode === 'auto') {
      this._autoQueue = true;
      this._autoReplay = true;
    }
    this.queuing = false;
    this.replayInterval = 10;

    this.protocol.addListener('queryError', (err, query) => this.emit('queryError', err, query));

    this.protocol.addListener('tokenExpired', () => {
      this.jwt = undefined;
      this.emit('tokenExpired');
    });
  }

  get autoQueue () {
    return this._autoQueue;
  }

  set autoQueue (value) {
    this._checkPropertyType('_autoQueue', 'boolean', value);
    this._autoQueue = value;
  }

  get autoReconnect () {
    return this.protocol.autoReconnect;
  }

  set autoReconnect (value) {
    this._checkPropertyType('autoReconnect', 'boolean', value);
    this.protocol.autoReconnect = value;
  }

  get autoReplay () {
    return this._autoReplay;
  }

  set autoReplay (value) {
    this._checkPropertyType('_autoReplay', 'boolean', value);
    this._autoReplay = value;
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
    return this.protocol.host;
  }

  get offlineQueue () {
    return this._offlineQueue;
  }

  get offlineQueueLoader () {
    return this._offlineQueueLoader;
  }

  set offlineQueueLoader (value) {
    this._checkPropertyType('_offlineQueueLoader', 'function', value);
    this._offlineQueueLoader = value;
  }

  get port () {
    return this.protocol.port;
  }

  get queueFilter () {
    return this._queueFilter;
  }

  set queueFilter (value) {
    this._checkPropertyType('_queueFilter', 'function', value);
    this._queueFilter= value;
  }

  get queueMaxSize () {
    return this._queueMaxSize;
  }

  set queueMaxSize (value) {
    this._checkPropertyType('_queueMaxSize', 'number', value);
    this._queueMaxSize = value;
  }

  get queueTTL () {
    return this._queueTTL;
  }

  set queueTTL (value) {
    this._checkPropertyType('_queueTTL', 'number', value);
    this._queueTTL = value;
  }

  get reconnectionDelay () {
    return this.protocol.reconnectionDelay;
  }

  get replayInterval () {
    return this._replayInterval;
  }

  set replayInterval (value) {
    this._checkPropertyType('_replayInterval', 'number', value);
    this._replayInterval = value;
  }

  get sslConnection () {
    return this.protocol.sslConnection;
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
    if (this.protocol.isReady()) {
      return Promise.resolve();
    }

    if (this.autoQueue) {
      this.startQueuing();
    }

    this.protocol.addListener('connect', () => {
      if (this.autoQueue) {
        this.stopQueuing();
      }

      if (this.autoReplay) {
        this.playQueue();
      }

      this.emit('connected');
    });

    this.protocol.addListener('networkError', error => {
      if (this.autoQueue) {
        this.startQueuing();
      }
      this.emit('networkError', error);
    });

    this.protocol.addListener('disconnect', () => {
      this.emit('disconnected');
    });

    this.protocol.addListener('reconnect', () => {
      if (this.autoQueue) {
        this.stopQueuing();
      }

      if (this.autoReplay) {
        this.playQueue();
      }

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

    this.protocol.addListener('discarded', data => this.emit('discarded', data));

    return this.protocol.connect();
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
    this._offlineQueue = [];
    return this;
  }

  /**
   * Disconnects from Kuzzle and invalidate this instance.
   */
  disconnect () {
    this.protocol.close();
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
    request.volatile.sdkInstanceId = this.protocol.id;
    request.volatile.sdkVersion = this.sdkVersion;

    /*
     * Do not add the token for the checkToken route, to avoid getting a token error when
     * a developer simply wish to verify his token
     */
    if (this.jwt !== undefined
      && !(request.controller === 'auth'
      && request.action === 'checkToken')
    ) {
      request.jwt = this.jwt;
    }

    let queuable = true;
    if (options && options.queuable === false) {
      queuable = false;
    }

    if (this.queueFilter) {
      queuable = queuable && this.queueFilter(request);
    }

    if (this.queuing) {
      if (queuable) {
        this._cleanQueue();
        this.emit('offlineQueuePush', {request});
        return new Promise((resolve, reject) => {
          this.offlineQueue.push({
            resolve,
            reject,
            request,
            ts: Date.now()
          });
        });
      }

      this.emit('discarded', {request});
      return Promise.reject(new Error(`Unable to execute request: not connected to a Kuzzle server.
Discarded request: ${JSON.stringify(request)}`));
    }

    return this.protocol.query(request);
  }

  /**
   * Starts the requests queuing.
   */
  startQueuing () {
    this.queuing = true;
    return this;
  }

  /**
   * Stops the requests queuing.
   */
  stopQueuing () {
    this.queuing = false;
    return this;
  }

  /**
   * Plays the requests queued during offline mode.
   */
  playQueue () {
    if (this.protocol.isReady()) {
      this._cleanQueue();
      this._dequeue();
    }
    return this;
  }

  /**
   * Adds a new controller and make it available in the SDK.
   *
   * @param {object} request
   * @param {object} [options] - Optional arguments
   * @returns {Kuzzle}
   */
  useController (controller) {
    if (!(controller instanceof BaseController)) {
      throw new Error('Controllers must inherits from the BaseController class.');
    }

    if (!(controller.name && controller.name.length > 0)) {
      throw new Error('Controllers must have a name.');
    }

    if (!(controller.accessor && controller.accessor.length > 0)) {
      throw new Error('Controllers must have an accessor.');
    }

    if (this[controller.accessor]) {
      throw new Error(`There is already a controller with the accessor '${controller.accessor}'. Please use another one.`);
    }

    controller.kuzzle = this;
    this[controller.accessor] = controller;

    return this;
  }

  _checkPropertyType (prop, typestr, value) {
    const wrongType = typestr === 'array' ? !Array.isArray(value) : typeof value !== typestr;

    if (wrongType) {
      throw new Error(`Expected ${prop} to be a ${typestr}, ${typeof value} received`);
    }
  }

  /**
   * Clean up the queue, ensuring the queryTTL and queryMaxSize properties are respected
   */
  _cleanQueue () {
    const now = Date.now();
    let lastDocumentIndex = -1;

    if (this.queueTTL > 0) {
      this.offlineQueue.forEach((query, index) => {
        if (query.ts < now - this.queueTTL) {
          lastDocumentIndex = index;
        }
      });

      if (lastDocumentIndex !== -1) {
        this.offlineQueue
          .splice(0, lastDocumentIndex + 1)
          .forEach(droppedRequest => {
            this.emit('offlineQueuePop', droppedRequest.query);
          });
      }
    }

    if (this.queueMaxSize > 0 && this.offlineQueue.length > this.queueMaxSize) {
      this.offlineQueue
        .splice(0, this.offlineQueue.length - this.queueMaxSize)
        .forEach(droppedRequest => {
          this.emit('offlineQueuePop', droppedRequest.query);
        });
    }
  }

  /**
   * Play all queued requests, in order.
   */
  _dequeue () {
    const
      uniqueQueue = {},
      dequeuingProcess = () => {
        if (this.offlineQueue.length > 0) {
          this.protocol.query(this.offlineQueue[0].request)
            .then(this.offlineQueue[0].resolve)
            .catch(this.offlineQueue[0].reject);
          this.emit('offlineQueuePop', this.offlineQueue.shift());

          setTimeout(() => {
            dequeuingProcess();
          }, Math.max(0, this.replayInterval));
        }
      };

    if (this.offlineQueueLoader) {
      if (typeof this.offlineQueueLoader !== 'function') {
        throw new Error('Invalid value for offlineQueueLoader property. Expected: function. Got: ' + typeof this.offlineQueueLoader);
      }

      const additionalQueue = this.offlineQueueLoader();
      if (Array.isArray(additionalQueue)) {
        this._offlineQueue = additionalQueue
          .concat(this.offlineQueue)
          .filter(query => {
            // throws if the request does not contain required attributes
            if (!query.request || query.request.requestId === undefined || !query.request.action || !query.request.controller) {
              throw new Error('Invalid offline queue request. One or more missing properties: requestId, action, controller.');
            }

            return uniqueQueue.hasOwnProperty(query.request.requestId) ? false : (uniqueQueue[query.request.requestId] = true);
          });
      } else {
        throw new Error('Invalid value returned by the offlineQueueLoader function. Expected: array. Got: ' + typeof additionalQueue);
      }
    }

    dequeuingProcess();
  }
}

module.exports = Kuzzle;
