'use strict';

const
  uuid = require('uuid'),
  KuzzleEventEmitter = require('../../../eventEmitter');

const
  _id = uuid.v4();

class AbtractWrapper extends KuzzleEventEmitter {

  constructor (host, options) {
    super();

    Object.defineProperties(this, {
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
      // configuration properties
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
                  cb: callbackFunction
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
    }
  }

  get id () {
    return _id;
  }

  /* @Abstract */
  connect() {
    throw new Error('Method "connect" is not implemented');
  }

  /**
   * Called when the client's connection is established
   */
  clientConnected(state, wasConnected) {
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
  disconnect() {
    this.state = 'offline';
    if (this.autoQueue) {
      this.startQueuing();
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
    if (this.isReady()) {
      cleanQueue(this);
      dequeue(this);
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

  query(request, options) {
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

  isReady() {
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

  _emitRequest (request) {
    return new Promise((resolve, reject) => {
      this.once(request.requestId, response => {
        if (request.action !== 'logout'
          && response.error
          && response.error.message === 'Token expired'
        ) {
          const error = new Error(response.error.message);
          Object.assign(error, response.error);
          error.status = response.status;
          this.emit('queryError', error, request);

          return reject(error);
        }

        return resolve(response);
      });

      this.send(request);
    });
  }
}

// make public getters enumerable
for (const prop of ['id']) {
  Object.defineProperty(AbstractWrapper.prototype, prop, {enumerable: true});
}

module.exports = AbtractWrapper;
