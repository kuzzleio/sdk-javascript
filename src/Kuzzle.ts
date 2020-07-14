import { KuzzleEventEmitter } from './core/KuzzleEventEmitter';

import { AuthController } from './controllers/Auth';
import { BulkController } from './controllers/Bulk';
import { CollectionController } from './controllers/Collection';
import { DocumentController } from './controllers/Document';
import { IndexController } from './controllers/Index';
import { RealtimeController } from './controllers/Realtime';
import { ServerController } from './controllers/Server';
import { SecurityController } from './controllers/Security';
import { MemoryStorageController } from './controllers/MemoryStorage';

import { uuidv4 } from './utils/uuidv4';
import { proxify } from './utils/proxify';
import { JSONObject } from './utils/interfaces';

// defined by webpack plugin
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
   * SDK name (e.g: js@7.4.2).
   */
  public sdkName: string;
  /**
   * Common volatile data that will be sent to all future requests.
   */
  public volatile: JSONObject;

  public auth: AuthController;
  public bulk: any;
  public collection: any;
  public document: any;
  public index: any;
  public ms: any;
  public realtime: any;
  public security: any;
  public server: any;

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

  private __proxy__: any;

  /**
   * @param protocol - the protocol to use
   * @param [options] - Kuzzle options
   */
  constructor(protocol: any, options: any = {}) {
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
        && protectedEvent.lastEmitted > now - this.eventTimeout)
      {
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

    this.protocol.addListener('queryError', (err, query) => this.emit('queryError', err, query));

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

      this.realtime.disconnected();

      this.emit('networkError', error);
    });

    this.protocol.addListener('disconnect', () => {
      this.realtime.disconnected();

      this.emit('disconnected');
    });

    this.protocol.addListener('reconnect', () => {
      if (this.autoQueue) {
        this.stopQueuing();
      }

      if (this.autoReplay) {
        this.playQueue();
      }

      this.realtime.reconnected();

      if (this.auth.authenticationToken) {
        return this.auth.checkToken()
          .then(res => {
            // shouldn't obtain an error but let's invalidate the token anyway
            if (!res.valid) {
              this.auth.authenticationToken = null;
            }
          })
          .catch(() => {
            this.auth.authenticationToken = null;
          })
          .then(() => this.emit('reconnected'));
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
   * @param {object} request
   * @param {object} [options] - Optional arguments
   * @returns {Promise<object>}
   */
  query (request: any = {}, options: any = {}) {
    if (typeof request !== 'object' || Array.isArray(request)) {
      throw new Error(`Kuzzle.query: Invalid request: ${JSON.stringify(request)}`);
    }

    if (typeof options !== 'object' || Array.isArray(options)) {
      throw new Error(`Kuzzle.query: Invalid "options" argument: ${JSON.stringify(options)}`);
    }

    if (!request.requestId) {
      request.requestId = uuidv4();
    }

    if (typeof request.refresh === 'undefined' && typeof options.refresh !== 'undefined') {
      request.refresh = options.refresh;
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

      this.emit('discarded', {request});
      return Promise.reject(new Error(`Unable to execute request: not connected to a Kuzzle server.
Discarded request: ${JSON.stringify(request)}`));
    }

    return this.protocol.query(request, options);
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
   * @param {BaseController} ControllerClass
   * @param {string} accessor
   * @returns {Kuzzle}
   */
  useController (ControllerClass, accessor) {
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
  _dequeue() {
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

module.exports = { Kuzzle };
