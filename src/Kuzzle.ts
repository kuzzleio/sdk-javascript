import { KuzzleEventEmitter } from './core/KuzzleEventEmitter';
import { KuzzleAbstractProtocol } from './protocols/abstract/Base';

import { AuthController } from './controllers/Auth';
import { BulkController } from './controllers/Bulk';
import { CollectionController } from './controllers/Collection';
import { DocumentController } from './controllers/Document';
import { IndexController } from './controllers/Index';
import { RealtimeController } from './controllers/Realtime';
import { ServerController } from './controllers/Server';
import { SecurityController } from './controllers/Security';
import { MemoryStorageController } from './controllers/MemoryStorage';
import { ObserveController } from './controllers/ObserveController';

import { Deprecation } from './utils/Deprecation';
import { uuidv4 } from './utils/uuidv4';
import { proxify } from './utils/proxify';
import { JSONObject } from './types';
import { RequestPayload } from './types/RequestPayload';
import { ResponsePayload } from './types/ResponsePayload';

// Defined by webpack plugin
declare const SDKVERSION: any;

const events = [
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

export class Kuzzle extends KuzzleEventEmitter {
  // We need to define any string key because users can register new controllers
  [key: string]: any;

  /**
   * Protocol used by the SDK to communicate with Kuzzle.
   */
  public protocol: any;
  /**
   * If true, automatically renews all subscriptions on a reconnected event.
   */
  public autoResubscribe: boolean;
  /**
   * Timeout before sending again a similar event.
   */
  public eventTimeout: number;
  /**
   * SDK version.
   */
  public sdkVersion: string;
  /**
   * SDK name (e.g: `js@7.4.2`).
   */
  public sdkName: string;
  /**
   * Common volatile data that will be sent to all future requests.
   */
  public volatile: JSONObject;
  /**
   * Handle deprecation warning in development mode (hidden in production)
   */
  public deprecationHandler: Deprecation;

  public auth: AuthController;
  public bulk: any;
  public collection: CollectionController;
  public document: DocumentController;
  public index: IndexController;
  public ms: any;
  public realtime: RealtimeController;
  public security: any;
  public server: any;
  public observe: ObserveController;

  private _protectedEvents: any;
  private _offlineQueue: any;
  private _autoQueue: any;
  private _autoReplay: any;
  private _offlineQueueLoader: any;
  private _queuing: boolean;
  private _queueFilter: any;
  private _queueMaxSize: any;
  private _queueTTL: any;
  private _replayInterval: any;
  private _tokenExpiredInterval: any;
  private _lastTokenExpired: any;
  private _cookieAuthentication: boolean;

  private __proxy__: any;

  /**
   * Instantiate a new SDK
   *
   * @example
   *
   * import { Kuzzle, WebSocket } from 'kuzzle-sdk';
   *
   * const kuzzle = new Kuzzle(
   *   new WebSocket('localhost')
   * );
   */
  constructor(
    /**
     * Network protocol to connect to Kuzzle. (e.g. `Http` or `WebSocket`)
     */
    protocol: KuzzleAbstractProtocol,
    options: {
      /**
       * Automatically renew all subscriptions on a `reconnected` event
       * Default: `true`
       */
      autoResubscribe?: boolean;
      /**
       * Time (in ms) during which a similar event is ignored
       * Default: `200`
       */
      eventTimeout?: number;
      /**
       * Common volatile data, will be sent to all future requests
       * Default: `{}`
       */
      volatile?: JSONObject;
      /**
       * If `true`, automatically queues all requests during offline mode
       * Default: `false`
       */
      autoQueue?: boolean;
      /**
       * If `true`, automatically replays queued requests
       * on a `reconnected` event
       * Default: `false`
       */
      autoReplay?: boolean;
      /**
       * Custom function called during offline mode to filter
       * queued requests on-the-fly
       */
      queueFilter?: (request: RequestPayload) => boolean;
      /**
       * Called before dequeuing requests after exiting offline mode,
       * to add items at the beginning of the offline queue
       */
      offlineQueueLoader?: (...any) => any;
      /**
       * Number of maximum requests kept during offline mode
       * Default: `500`
       */
      queueMaxSize?: number;
      /**
       * Time a queued request is kept during offline mode, in milliseconds
       * Default: `120000`
       */
      queueTTL?: number;
      /**
       * Delay between each replayed requests, in milliseconds
       * Default: `10`
       */
      replayInterval?: number;
      /**
       * Time (in ms) during which a TokenExpired event is ignored
       * Default: `1000`
       */
      tokenExpiredInterval?: number;
      /**
       * If set to `auto`, the `autoQueue` and `autoReplay` are also set to `true`
       */
      offlineMode?: 'auto';
      /**
       * Show deprecation warning in development mode (hidden either way in production)
       * Default: `true`
       */
      deprecationWarning?: boolean;
      /**
       * If `true` uses cookie to store token
       * Only supported in a browser
       * Default: `false`
       */
      cookieAuth?: boolean;
    } = {}
  ) {
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

    this.autoResubscribe = typeof options.autoResubscribe === 'boolean'
      ? options.autoResubscribe
      : true;

    this.eventTimeout = typeof options.eventTimeout === 'number'
      ? options.eventTimeout
      : 200;

    this.sdkVersion = typeof SDKVERSION === 'undefined'
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      ? require('../package').version
      : SDKVERSION;

    this.sdkName = `js@${this.sdkVersion}`;

    this.volatile = typeof options.volatile === 'object'
      ? options.volatile
      : {};

    this.deprecationHandler = new Deprecation(
      typeof options.deprecationWarning === 'boolean' ? options.deprecationWarning : true
    );

    this._cookieAuthentication = typeof options.cookieAuth === 'boolean'
      ? options.cookieAuth
      : false;

    if (this._cookieAuthentication && typeof XMLHttpRequest === 'undefined') {
      throw new Error('Support for cookie authentication with cookieAuth option is not supported outside a browser');
    }

    // controllers
    this.useController(AuthController, 'auth');
    this.useController(BulkController, 'bulk');
    this.useController(CollectionController, 'collection');
    this.useController(DocumentController, 'document');
    this.useController(IndexController, 'index');
    this.useController(MemoryStorageController, 'ms');
    this.useController(RealtimeController, 'realtime');
    this.useController(SecurityController, 'security');
    this.useController(ServerController, 'server');
    this.useController(ObserveController, 'observe');

    // offline queue
    this._offlineQueue = [];
    this._autoQueue = typeof options.autoQueue === 'boolean'
      ? options.autoQueue
      : false;
    this._autoReplay = typeof options.autoReplay === 'boolean'
      ? options.autoReplay
      : false;
    this._offlineQueueLoader = typeof options.offlineQueueLoader === 'function'
      ? options.offlineQueueLoader
      : null;
    this._queueFilter = typeof options.queueFilter === 'function'
      ? options.queueFilter
      : null;
    this._queueMaxSize = typeof options.queueMaxSize === 'number'
      ? options.queueMaxSize
      : 500;
    this._queueTTL = typeof options.queueTTL === 'number'
      ? options.queueTTL
      : 120000;
    this._replayInterval = typeof options.replayInterval === 'number'
      ? options.replayInterval
      : 10;
    this._tokenExpiredInterval = typeof options.tokenExpiredInterval === 'number'
      ? options.tokenExpiredInterval
      : 1000;

    if (options.offlineMode === 'auto') {
      this._autoQueue = true;
      this._autoReplay = true;
    }
    this._queuing = false;

    this._lastTokenExpired = null;

    return proxify(this, {
      seal: true,
      name: 'kuzzle',
      exposeApi: true
    }) as Kuzzle;
  }

  get authenticated () {
    return this.auth.authenticationToken && !this.auth.authenticationToken.expired;
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

  get cookieAuthentication () {
    return this._cookieAuthentication;
  }

  get connected () {
    return this.protocol.connected;
  }

  get host () {
    return this.protocol.host;
  }

  get jwt () {
    if (!this.auth.authenticationToken) {
      return null;
    }

    return this.auth.authenticationToken.encodedJwt;
  }

  set jwt (encodedJwt) {
    this.auth.authenticationToken = encodedJwt;
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

  get tokenExpiredInterval () {
    return this._tokenExpiredInterval;
  }

  set tokenExpiredInterval (value) {
    this._checkPropertyType('_tokenExpiredInterval', 'number', value);
    this._tokenExpiredInterval = value;
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
      if ( protectedEvent.lastEmitted
        && protectedEvent.lastEmitted > now - this.eventTimeout
      ) {
        return false;
      }
      protectedEvent.lastEmitted = now;
    }

    return this._superEmit(eventName, ...payload);
  }

  private _superEmit (eventName, ...payload) {
    return super.emit(eventName, ...payload);
  }

  /**
   * Connects to a Kuzzle instance
   */
  connect (): Promise<void> {
    if (this.protocol.isReady()) {
      return Promise.resolve();
    }

    if (this.autoQueue) {
      this.startQueuing();
    }

    this.protocol.addListener('queryError', ({ error, request }) => {
      this.emit('queryError', { error, request });
    });

    this.protocol.addListener('tokenExpired', () => this.tokenExpired());

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

      this.emit('reconnected');
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

    return this._superAddListener(event, listener);
  }

  private _superAddListener (event, listener) {
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
   * This is a low-level method, exposed to allow advanced SDK users to bypass
   * high-level methods.
   * Base method used to send read queries to Kuzzle
   *
   * Takes an optional argument object with the following properties:
   *    - volatile (object, default: null):
   *        Additional information passed to notifications to other users
   *
   * @param req
   * @param opts - Optional arguments
   */
  query (req: RequestPayload = {}, opts: JSONObject = {}): Promise<ResponsePayload> {
    if (typeof req !== 'object' || Array.isArray(req)) {
      throw new Error(`Kuzzle.query: Invalid request: ${JSON.stringify(req)}`);
    }

    if (typeof opts !== 'object' || Array.isArray(opts)) {
      throw new Error(`Kuzzle.query: Invalid "options" argument: ${JSON.stringify(opts)}`);
    }

    const request = JSON.parse(JSON.stringify(req));
    const options = JSON.parse(JSON.stringify(opts));

    if (!request.requestId) {
      request.requestId = uuidv4();
    }

    if (request.refresh === undefined && options.refresh !== undefined) {
      request.refresh = options.refresh;
    }

    if (request.retryOnConflict === undefined && options.retryOnConflict !== undefined) {
      request.retryOnConflict = options.retryOnConflict;
    }

    if (! request.volatile) {
      request.volatile = this.volatile;
    }
    else if (
      typeof request.volatile !== 'object'
      || Array.isArray(request.volatile)
    ) {
      throw new Error(`Kuzzle.query: Invalid volatile argument received: ${JSON.stringify(request.volatile)}`);
    }

    for (const item of Object.keys(this.volatile)) {
      if (request.volatile[item] === undefined) {
        request.volatile[item] = this.volatile[item];
      }
    }
    request.volatile.sdkInstanceId = request.volatile.sdkInstanceId || this.protocol.id;
    request.volatile.sdkName = request.volatile.sdkName || this.sdkName;

    this.auth.authenticateRequest(request);

    let queuable = true;
    if (options && options.queuable === false) {
      queuable = false;
    }

    if (this.queueFilter) {
      queuable = queuable && this.queueFilter(request);
    }

    if (this._queuing) {
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

      this.emit('discarded', { request });
      return Promise.reject(new Error(`Unable to execute request: not connected to a Kuzzle server.
Discarded request: ${JSON.stringify(request)}`));
    }

    return this.protocol.query(request, options)
      .then((response: ResponsePayload) => this.deprecationHandler.logDeprecation(response));
  }

  /**
   * Starts the requests queuing.
   */
  startQueuing () {
    this._queuing = true;
    return this;
  }

  /**
   * Stops the requests queuing.
   */
  stopQueuing () {
    this._queuing = false;
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
   * On token expiration, reset jwt and unsubscribe all rooms.
   * Throttles to avoid duplicate event triggers.
   */
  tokenExpired() {
    const now = Date.now();

    if ((now - this._lastTokenExpired) < this.tokenExpiredInterval) {
      // event was recently already fired
      return;
    }

    this._lastTokenExpired = now;

    this.emit('tokenExpired');
  }

  /**
   * Adds a new controller and make it available in the SDK.
   *
   * @param ControllerClass
   * @param accessor
   */
  useController (ControllerClass: any, accessor: string) {
    if (!(accessor && accessor.length > 0)) {
      throw new Error('You must provide a valid accessor.');
    }

    if (this.__proxy__ ? this.__proxy__.hasProp(accessor) : this[accessor]) {
      throw new Error(`There is already a controller with the accessor '${accessor}'. Please use another one.`);
    }

    const controller = new ControllerClass(this);

    if (!(controller.name && controller.name.length > 0)) {
      throw new Error('Controllers must have a name.');
    }

    if (controller.kuzzle !== this) {
      throw new Error('You must pass the Kuzzle SDK instance to the parent constructor.');
    }

    if (this.__proxy__) {
      this.__proxy__.registerProp(accessor);
    }
    this[accessor] = controller;

    return this;
  }

  private _checkPropertyType (prop, typestr, value) {
    const wrongType = typestr === 'array' ? !Array.isArray(value) : typeof value !== typestr;

    if (wrongType) {
      throw new Error(`Expected ${prop} to be a ${typestr}, ${typeof value} received`);
    }
  }

  /**
   * Clean up the queue, ensuring the queryTTL and queryMaxSize properties are respected
   */
  private _cleanQueue () {
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
  private _dequeue() {
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

      return Promise.resolve()
        .then(() => this.offlineQueueLoader())
        .then(additionalQueue => {
          if (Array.isArray(additionalQueue)) {
            this._offlineQueue = additionalQueue
              .concat(this.offlineQueue)
              .filter(query => {
                // throws if the request does not contain required attributes
                if (!query.request || query.request.requestId === undefined || !query.request.action || !query.request.controller) {
                  throw new Error('Invalid offline queue request. One or more missing properties: requestId, action, controller.');
                }

                return Object.prototype.hasOwnProperty.call(
                  uniqueQueue,
                  query.request.requestId)
                  ? false
                  : (uniqueQueue[query.request.requestId] = true);
              });

            dequeuingProcess();
          } else {
            throw new Error('Invalid value returned by the offlineQueueLoader function. Expected: array. Got: ' + typeof additionalQueue);
          }
        });
    }

    dequeuingProcess();
  }
}
