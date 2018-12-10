'use strict';

const
  uuidv4 = require('../../uuidv4'),
  KuzzleEventEmitter = require('../../eventEmitter');

// read-only properties
let
  _host,
  _port,
  _ssl;

class AbstractWrapper extends KuzzleEventEmitter {

  constructor (options = {}) {
    super();

    _host = options.host;
    _port = typeof options.port === 'number' ? options.port : 7512;
    _ssl = typeof options.sslConnection === 'boolean' ? options.sslConnection : false;

    this.id = uuidv4();
    this.autoReplay = false;
    this.autoQueue = false;
    this.offlineQueue = [];
    this.offlineQueueLoader = null;
    this.queueFilter = null;
    this.queueMaxSize = 500;
    this.queueTTL = 120000;
    this.queuing = false;
    this.replayInterval = 10;
    this.state = 'offline';

    Object.keys(options).forEach(opt => {
      if (this.hasOwnProperty(opt) && Object.getOwnPropertyDescriptor(this, opt).writable) {
        this[opt] = options[opt];
      }
    });
  }

  get host () {
    return _host;
  }

  get port () {
    return _port;
  }

  get ssl () {
    return _ssl;
  }

  /**
   * @abstract
   * @returns {Promise<any>}
   */
  connect () {
    throw new Error('Method "connect" is not implemented');
  }

  /**
   * @abstract
   * @param request
   * @returns {Promise<any>}
   */
  send () {
    throw new Error('Method "send" is not implemented');
  }

  /**
   * Called when the client's connection is established
   */
  clientConnected (state, wasConnected) {
    this.state = state || 'ready';
    this.emit(wasConnected && 'reconnect' || 'connect');

    if (this.autoQueue) {
      this.stopQueuing();
    }

    if (this.autoReplay) {
      this.playQueue();
    }
  }

  /**
   * Called when the client's connection is closed
   */
  close () {
    this.state = 'offline';
    if (this.autoQueue) {
      this.startQueuing();
    }
  }

  /**
   * Empties the offline queue without replaying it.
   */
  flushQueue () {
    this.offlineQueue = [];
  }

  /**
   * Replays the requests queued during offline mode.
   */
  playQueue () {
    if (this.isReady()) {
      this._cleanQueue();
      this._dequeue();
    }
  }

  /**
   * Starts the requests queuing. Works only during offline mode, and if the autoQueue option is set to false.
   */
  startQueuing () {
    this.queuing = true;
  }

  /**
   * Stops the requests queuing. Works only during offline mode, and if the autoQueue option is set to false.
   */
  stopQueuing () {
    this.queuing = false;
  }

  query (request, options) {
    let queuable = options && (options.queuable !== false) || true;

    if (this.queueFilter) {
      queuable = queuable && this.queueFilter(request);
    }

    if (this.queuing && queuable) {
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

    if (this.isReady()) {
      return this._emitRequest(request);
    }

    return Promise.reject(new Error(`Unable to execute request: not connected to a Kuzzle server.
Discarded request: ${JSON.stringify(request)}`));
  }

  isReady () {
    return this.state === 'ready';
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
          this._emitRequest(this.offlineQueue[0].request)
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
        this.offlineQueue = additionalQueue
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

  _emitRequest (request) {
    return new Promise((resolve, reject) => {
      this.once(request.requestId, response => {
        if (response.error) {
          const error = new Error(response.error.message);
          Object.assign(error, response.error);
          error.status = response.status;
          response.error = error;
          this.emit('queryError', error, request);

          if (request.action !== 'logout' && error.message === 'Token expired') {
            this.emit('tokenExpired');
          }

          return reject(error);
        }

        return resolve(response);
      });

      this.send(request);
    });
  }
}

module.exports = AbstractWrapper;
