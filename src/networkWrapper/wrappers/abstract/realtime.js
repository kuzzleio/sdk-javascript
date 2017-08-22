'use strict';

const
  KuzzleEventEmitter = require('../../../eventEmitter');

class RTWrapper extends KuzzleEventEmitter {

  constructor (host, options) {
    super();

    Object.defineProperties(this, {
      host: {
        value: host,
        writable: false,
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
      autoReconnect: {
        value: (options && typeof options.autoReconnect === 'boolean') ? options.autoReconnect : true,
        writable: true,
        enumerable: true
      },
      reconnectionDelay: {
        value: (options && typeof options.reconnectionDelay === 'number') ? options.reconnectionDelay : 1000,
        writable: true,
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

      if (options.offlineMode === 'auto' && this.autoReconnect) {
        this.autoQueue = this.autoReplay = true;
      }
    }

    Object.defineProperty(this, 'requestHistory', {
      value: {},
      writable: true
    });

    cleanHistory(this.requestHistory);

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
    this.emitEvent(this.wasConnected && 'reconnect' || 'connect');
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

    this.emitEvent('disconnect');
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

    this.emitEvent('networkError', error);
    if (this.autoReconnect && !this.retrying && !this.stopRetryingToConnect) {
      this.retrying = true;
      setTimeout(() => {
        this.retrying = false;
        this.connect(this.host);
      }, this.reconnectionDelay);
    } else {
      this.emitEvent('disconnect');
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
    if (this.state !== 'connected') {
      return cb(new Error('Not Connected'));
    }
    this.query(object, options, (error, response) => {
      if (error) {
        return cb(error);
      }
      this.on(response.result.channel, data => {
        data.fromSelf = this.requestHistory[data.requestId] !== undefined;
        notificationCB(data);
      });
      cb(null, response.result);
    });
  }

  unsubscribe(object, options, channel, cb) {
    this.removeAllListeners(channel);
    this.query(object, options, (err, res) => {
      if (cb) {
        cb(err, err ? undefined : res.result);
      }
    });
  }

  query(object, options, cb) {
    let queuable = options && (options.queuable !== false) || true;

    if (this.queueFilter) {
      queuable = queuable && this.queueFilter(object);
    }

    if (this.queuing && queuable) {
      cleanQueue(this, object, cb);
      this.emitEvent('offlineQueuePush', {query: object, cb: cb});
      return this.offlineQueue.push({ts: Date.now(), query: object, cb: cb});
    }

    if (this.state === 'connected') {
      return emitRequest(this, object, cb);
    }

    return discardRequest(object, cb);
  }
}
/**
 * Emit a request to Kuzzle
 *
 * @param {RTWrapper} network
 * @param {object} request
 * @param {responseCallback} [cb]
 */
function emitRequest (network, request, cb) {
  if (request.jwt !== undefined || cb) {
    network.once(request.requestId, response => {
      let error = null;

      if (request.action !== 'logout' && response.error && response.error.message === 'Token expired') {
        network.emitEvent('tokenExpired', request, cb);
      }

      if (response.error) {
        error = new Error(response.error.message);
        Object.assign(error, response.error);
        error.status = response.status;
        network.emitEvent('queryError', error, request, cb);
      }

      if (cb) {
        cb(error, response);
      }
    });
  }
  // Track requests made to allow Room.subscribeToSelf to work
  network.requestHistory[request.requestId] = Date.now();
  network.send(request);
}

function discardRequest(object, cb) {
  if (cb) {
    cb(new Error('Unable to execute request: not connected to a Kuzzle server.\nDiscarded request: ' + JSON.stringify(object)));
  }
}

/**
 * Clean up the queue, ensuring the queryTTL and queryMaxSize properties are respected
 * @param {RTWrapper} network
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
          network.emitEvent('offlineQueuePop', droppedRequest.query);
        });
    }
  }

  if (network.queueMaxSize > 0 && network.offlineQueue.length > network.queueMaxSize) {
    network.offlineQueue
      .splice(0, network.offlineQueue.length - network.queueMaxSize)
      .forEach(droppedRequest => {
        network.emitEvent('offlineQueuePop', droppedRequest.query);
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
        network.emitEvent('offlineQueuePop', network.offlineQueue.shift());

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

/**
 * Clean history from requests made more than 10s ago
 */
function cleanHistory (requestHistory) {
  const now = Date.now();

  for (const key in requestHistory) {
    if (requestHistory[key] < now - 10000) {
      delete requestHistory[key];
    }
  }

  setTimeout(function () {
    cleanHistory(requestHistory);
  }, 1000);
}

module.exports = RTWrapper;
