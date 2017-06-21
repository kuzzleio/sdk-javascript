var
  KuzzleEventEmitter = require('../../eventEmitter');

function RTWrapper(host, options) {
  var self = this;

  KuzzleEventEmitter.call(this);

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
    autoResubscribe: {
      value: true,
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
    Object.keys(options).forEach(function (opt) {
      if (self.hasOwnProperty(opt) && Object.getOwnPropertyDescriptor(self, opt).writable) {
        self[opt] = options[opt];
      }
    });

    if (options.offlineMode === 'auto' && this.autoReconnect) {
      this.autoQueue = this.autoReplay = this.autoResubscribe = true;
    }
  }

}
//RTWrapper.prototype = Object.create(AbstractWrapper.prototype);

RTWrapper.prototype.connect = function() {
  var self = this;

  this.state = 'connecting';
  this.queuing = true;

  this.onConnect(function () {
    self.state = 'connected';
    self.queuing = false;
  });

  this.onReconnect(function () {
    self.state = 'connected';
  });

  this.onConnectError(function() {
    self.state = 'error';
  });

  this.onDisconnect(function () {
    self.state = 'offline';
    if (self.autoQueue) {
      self.queuing = true;
    }
  });
};

// Helper function ensuring that this Kuzzle object is still valid before performing a query
RTWrapper.prototype.isValid = function () {
  if (this.state === 'disconnected') {
    throw new Error('This Kuzzle object has been invalidated. Did you try to access it after a disconnect call?');
  }
};

/**
 * Empties the offline queue without replaying it.
 */
RTWrapper.prototype.flushQueue = function () {
  this.offlineQueue = [];
};

/**
 * Replays the requests queued during offline mode.
 */
RTWrapper.prototype.replayQueue = function() {
  cleanQueue.call(this);
  dequeue.call(this);
};

/**
 * Starts the requests queuing. Works only during offline mode, and if the autoQueue option is set to false.
 */
RTWrapper.prototype.startQueuing = function () {
  if (this.state === 'offline' && !this.autoQueue) {
    this.queuing = true;
  }
  return this;
};

/**
 * Stops the requests queuing. Works only during offline mode, and if the autoQueue option is set to false.
 */
RTWrapper.prototype.stopQueuing = function () {
  if (this.state === 'offline' && !this.autoQueue) {
    this.queuing = false;
  }

  return this;
};

RTWrapper.prototype.query = function(object, options, cb) {
  if (this.state === 'connected' || this.state === 'ready') {
    emitRequest.call(this, object, cb);
  } else if (options && options.queuable === false) {
    discardRequest(object, cb);
  } else if (this.queuing || (options && options.queuable === true)) {
    cleanQueue.call(this, object, cb);
    if (!this.queueFilter || this.queueFilter(object)) {
      this.offlineQueue.push({ts: Date.now(), query: object, cb: cb});
      this.emitEvent('offlineQueuePush', {query: object, cb: cb});
    }
  } else {
    discardRequest(object, cb);
  }
};

/**
 * Emit a request to Kuzzle
 *
 * @param {object} request
 * @param {responseCallback} [cb]
 */
function emitRequest (request, cb) {
  var self = this;
  if (this.jwtToken !== undefined || cb) {
    this.once(request.requestId, function (response) {
      var error = null;

      if (request.action !== 'logout' && response.error && response.error.message === 'Token expired') {
        self.jwtToken = undefined;
        self.emitEvent('tokenExpired', request, cb);
      }

      if (response.error) {
        error = new Error(response.error.message);
        Object.assign(error, response.error);
        error.status = response.status;
        self.emitEvent('queryError', error, request, cb);
      }

      if (cb) {
        cb(error, response);
      }
    });
  }

  this.send(request);

  // Track requests made to allow Room.subscribeToSelf to work
  this.emitEvent('emitRequest', request);
}

function discardRequest(object, cb) {
  if (cb) {
    cb(new Error('Unable to execute request: not connected to a Kuzzle server.\nDiscarded request: ' + JSON.stringify(object)));
  }
}

/**
 * Clean up the queue, ensuring the queryTTL and queryMaxSize properties are respected
 */
function cleanQueue () {
  var
    self = this,
    now = Date.now(),
    lastDocumentIndex = -1;

  if (self.queueTTL > 0) {
    self.offlineQueue.forEach(function (query, index) {
      if (query.ts < now - self.queueTTL) {
        lastDocumentIndex = index;
      }
    });

    if (lastDocumentIndex !== -1) {
      self.offlineQueue
        .splice(0, lastDocumentIndex + 1)
        .forEach(function (droppedRequest) {
          self.emitEvent('offlineQueuePop', droppedRequest.query);
        });
    }
  }

  if (self.queueMaxSize > 0 && self.offlineQueue.length > self.queueMaxSize) {
    self.offlineQueue
      .splice(0, self.offlineQueue.length - self.queueMaxSize)
      .forEach(function (droppedRequest) {
        self.emitEvent('offlineQueuePop', droppedRequest.query);
      });
  }
}

/**
 * Play all queued requests, in order.
 */
function dequeue () {
  var
    self = this,
    additionalQueue,
    uniqueQueue = {},
    dequeuingProcess = function () {
      if (self.offlineQueue.length > 0) {
        emitRequest.call(self, self.offlineQueue[0].query, self.offlineQueue[0].cb);
        self.emitEvent('offlineQueuePop', self.offlineQueue.shift());

        setTimeout(function () {
          dequeuingProcess();
        }, Math.max(0, self.replayInterval));
      } else {
        self.queuing = false;
      }
    };

  if (self.offlineQueueLoader) {
    if (typeof self.offlineQueueLoader !== 'function') {
      throw new Error('Invalid value for offlineQueueLoader property. Expected: function. Got: ' + typeof self.offlineQueueLoader);
    }

    additionalQueue = self.offlineQueueLoader();
    if (Array.isArray(additionalQueue)) {
      self.offlineQueue = additionalQueue
        .concat(self.offlineQueue)
        .filter(function (request) {
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

RTWrapper.prototype = Object.create(KuzzleEventEmitter.prototype);
RTWrapper.prototype.constructor = RTWrapper;

module.exports = RTWrapper;