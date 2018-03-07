'use strict';

const
  uuidv4 = require('uuid/v4'),
  KuzzleEventEmitter = require('../../../eventEmitter');

class RTWrapper extends KuzzleEventEmitter {

  constructor (host, options) {
    super();

    Object.defineProperties(this, {
      id: {
        value: uuidv4()
      },
      host: {
        value: host,
        enumerable: true
      },
      port: {
        value: (options && typeof options.port === 'number') ? options.port : 7512,
        enumerable: true
      },
      ssl: {
        value: (options && typeof options.sslConnection === 'boolean') ? options.sslConnection : false,
        enumerable: true
      },
      queuing: {
        value: false,
        writable: true
      },
      reconnectionDelay: {
        value: (options && typeof options.reconnectionDelay === 'number') ? options.reconnectionDelay : 1000,
        enumerable: true
      },
      // configuration properties
      autoReconnect: {
        value: (options && typeof options.autoReconnect === 'boolean') ? options.autoReconnect : true,
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
      state: {
        value: 'offline',
        enumerable: true,
        writable: true
      },
      /*
        Offline queue use the following format:
              [
                {
                  ts: <query timestamp>,
                  query: 'query',
                  resolve,
                  reject
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
      offlineQueueLoader: {
        value: null,
        enumerable: true,
        writable: true
      }
    });

    if (options) {
      Object.keys(options).forEach(opt => {
        if (this.hasOwnProperty(opt) && Object.getOwnPropertyDescriptor(this, opt).writable) {
          this[opt] = options[opt];
        }
      });

      if (options.offlineMode === 'auto' && this.autoReconnect) {
        this.autoQueue = this.autoReplay = true;
      }
    }

    this.wasConnected = false;
    this.stopRetryingToConnect = false;
    this.retrying = false;
  }

  connect() {
    this.state = 'connecting';
    if (this.autoQueue) {
      this.startQueuing();
    }
  }

  /**
   * Called when the client's connection is established
   */
  clientConnected() {
    this.state = 'connected';
    this.emit(this.wasConnected && 'reconnect' || 'connect');
    this.wasConnected = true;
    this.stopRetryingToConnect = false;

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
  clientDisconnected() {
    this.state = 'offline';
    if (this.autoQueue) {
      this.startQueuing();
    }

    this.emit('disconnect');
  }

  /**
   * Called when the client's connection is closed with an error state
   *
   * @param {Error} error
   */
  clientNetworkError(error) {
    this.state = 'offline';
    if (this.autoQueue) {
      this.startQueuing();
    }

    this.emit('networkError', error);
    if (this.autoReconnect && !this.retrying && !this.stopRetryingToConnect) {
      this.retrying = true;
      setTimeout(() => {
        this.retrying = false;
        this.connect();
      }, this.reconnectionDelay);
    } else {
      this.emit('disconnect');
    }
  }

  /**
   * Empties the offline queue without replaying it.
   */
  flushQueue() {
    this.offlineQueue = [];
  }

  /**
   * Replays the requests queued during offline mode.
   */
  playQueue() {
    if (this.state === 'connected') {
      this._cleanQueue();
      this._dequeue();
    }
  }

  /**
   * Starts the requests queuing. Works only during offline mode, and if the autoQueue option is set to false.
   */
  startQueuing() {
    this.queuing = true;
  }

  /**
   * Stops the requests queuing. Works only during offline mode, and if the autoQueue option is set to false.
   */
  stopQueuing() {
    this.queuing = false;
  }

  subscribe(object, options, cb) {
    if (this.state !== 'connected') {
      return Promise.reject(new Error('Not Connected'));
    }

    return this.query(object, options)
      .then(response => {
        this.on(response.result.channel, data => {
          data.fromSelf = data.volatile !== undefined && data.volatile.sdkInstanceId === this.id;
          cb(data);
        });

        return response.result;
      });
  }

  unsubscribe(object, channel) {
    this.removeAllListeners(channel);
    return this.query(object);
  }

  /**
   * Sends a raw request to Kuzzle
   *
   * @param {object} request
   * @param options
   * @returns {Promise}
   */
  query(request, options) {
    let queuable = options && (options.queuable !== false) || true;

    if (this.queueFilter) {
      queuable = queuable && this.queueFilter(request);
    }

    if (this.queuing && queuable) {
      this._cleanQueue();

      this.emit('offlineQueuePush', {query: request});
      return new Promise((resolve, reject) => {
        this.offlineQueue.push({
          resolve,
          reject,
          ts: Date.now(),
          query: request
        });
      });
    }

    if (this.state === 'connected') {
      return this._emitRequest(request);
    }

    return this.constructor._discardRequest(request);
  }

  /**
   * Clean up the queue, ensuring the queryTTL and queryMaxSize properties are respected
   *
   * @private
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
   *
   * @private
   */
  _dequeue () {
    const
      uniqueQueue = {},
      dequeuingProcess = () => {
        if (this.offlineQueue.length > 0) {
          this._emitRequest(this.offlineQueue[0].query)
            .then(response => this.offlineQueue[0].resolve(response))
            .catch(error => this.offlineQueue[0].reject(error));

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
          .filter(request => {
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
   * @param request
   * @returns {Promise<any>}
   * @private
   */
  _emitRequest (request) {
    return new Promise((resolve, reject) => {
      this.once(request.requestId, response => {
        let error = null;

        if (request.action !== 'logout' && response.error && response.error.message === 'Token expired') {
          this.emit('tokenExpired', request);
        }

        if (response.error) {
          error = new Error(response.error.message);
          Object.assign(error, response.error);
          error.status = response.status;

          this.emit('queryError', error);
          return reject(error);
        }

        return resolve(response);
      });

      // Track requests made to allow Room.subscribeToSelf to work
      this.send(request);
    });
  }

  /**
   * @param object
   * @returns {Promise<never>}
   * @private
   */
  static _discardRequest (object) {
    return Promise.reject(new Error('Unable to execute request: not connected to a Kuzzle server.\nDiscarded request: ' + JSON.stringify(object)));
  }

}

module.exports = RTWrapper;
