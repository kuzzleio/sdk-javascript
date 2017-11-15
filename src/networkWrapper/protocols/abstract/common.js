'use strict';

const
  uuidv4 = require('uuid/v4'),
  KuzzleEventEmitter = require('../../../eventEmitter');

class AbtractWrapper extends KuzzleEventEmitter {

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
        enumerable: true,
        writable: false
      },
      ssl: {
        value: (options && typeof options.sslConnection === 'boolean') ? options.sslConnection : false,
        writable: true,
        enumerable: false
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
    if (isConnected(this.state)) {
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

  subscribe(object, options, notificationCB, cb) {
    throw new Error('Not Implemented');
  }

  unsubscribe(object, options, channel, cb) {
    throw new Error('Not Implemented');
  }

  query(object, options, cb) {
    let queuable = options && (options.queuable !== false) || true;

    if (this.queueFilter) {
      queuable = queuable && this.queueFilter(object);
    }

    if (this.queuing && queuable) {
      cleanQueue(this, object, cb);
      this.emit('offlineQueuePush', {query: object, cb: cb});
      return this.offlineQueue.push({ts: Date.now(), query: object, cb: cb});
    }

    if (isConnected(this.state)) {
      return emitRequest(this, object, cb);
    }

    return discardRequest(object, cb);
  }
}

/**
 * Emit a request to Kuzzle
 *
 * @param {AbstractWrapper} network
 * @param {object} request
 * @param {responseCallback} [cb]
 */
function emitRequest (network, request, cb) {
  if (request.jwt !== undefined || cb) {
    network.once(request.requestId, response => {
      let error = null;

      if (request.action !== 'logout' && response.error && response.error.message === 'Token expired') {
        network.emit('tokenExpired', request, cb);
      }

      if (response.error) {
        error = new Error(response.error.message);
        Object.assign(error, response.error);
        error.status = response.status;
        network.emit('queryError', error, request, cb);
      }

      if (cb) {
        cb(error, response);
      }
    });
  }
  // Track requests made to allow Room.subscribeToSelf to work
  network.send(request);
}

function discardRequest(object, cb) {
  if (cb) {
    cb(new Error('Unable to execute request: not connected to a Kuzzle server.\nDiscarded request: ' + JSON.stringify(object)));
  }
}

/**
 * Clean up the queue, ensuring the queryTTL and queryMaxSize properties are respected
 * @param {AbstractWrapper} network
 */
function cleanQueue (network) {
  const now = Date.now();
  let lastDocumentIndex = -1;

  if (network.queueTTL > 0) {
    network.offlineQueue.forEach((query, index) => {
      if (query.ts < now - network.queueTTL) {
        lastDocumentIndex = index;
      }
    });

    if (lastDocumentIndex !== -1) {
      network.offlineQueue
        .splice(0, lastDocumentIndex + 1)
        .forEach(droppedRequest => {
          network.emit('offlineQueuePop', droppedRequest.query);
        });
    }
  }

  if (network.queueMaxSize > 0 && network.offlineQueue.length > network.queueMaxSize) {
    network.offlineQueue
      .splice(0, network.offlineQueue.length - network.queueMaxSize)
      .forEach(droppedRequest => {
        network.emit('offlineQueuePop', droppedRequest.query);
      });
  }
}

/**
 * Play all queued requests, in order.
 */
function dequeue (network) {
  const
    uniqueQueue = {},
    dequeuingProcess = () => {
      if (network.offlineQueue.length > 0) {
        emitRequest(network, network.offlineQueue[0].query, network.offlineQueue[0].cb);
        network.emit('offlineQueuePop', network.offlineQueue.shift());

        setTimeout(() => {
          dequeuingProcess();
        }, Math.max(0, network.replayInterval));
      }
    };

  if (network.offlineQueueLoader) {
    if (typeof network.offlineQueueLoader !== 'function') {
      throw new Error('Invalid value for offlineQueueLoader property. Expected: function. Got: ' + typeof network.offlineQueueLoader);
    }

    const additionalQueue = network.offlineQueueLoader();
    if (Array.isArray(additionalQueue)) {
      network.offlineQueue = additionalQueue
        .concat(network.offlineQueue)
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

function isConnected(state) {
  return state === 'ready' || state === 'connected';
}

module.exports = AbtractWrapper;
