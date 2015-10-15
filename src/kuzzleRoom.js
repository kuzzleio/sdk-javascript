/**
 * This is a global callback pattern, called by all asynchronous functions of the Kuzzle object.
 *
 * @callback responseCallback
 * @param {Object} err - Error object, NULL if the query is successful
 * @param {Object} data - The content of the query response
 */

/**
 * Callback pattern: simple callback called when an async processus is finished
 *
 * @callback readyCallback
 */


/**
 * This object is the result of a subscription request, allowing to manipulate the subscription itself.
 *
 * In Kuzzle, you don’t exactly subscribe to a room or a topic but, instead, you subscribe to documents.
 *
 * What it means is that, to subscribe, you provide to Kuzzle a set of matching filters.
 * Once you have subscribed, if a pub/sub message is published matching your filters, or if a matching stored
 * document change (because it is created, updated or deleted), then you’ll receive a notification about it.
 *
 * @param {object} kuzzleDataCollection - an instantiated and valid kuzzle object
 * @param {object} [options] - subscription optional configuration
 * @constructor
 */
function KuzzleRoom(kuzzleDataCollection, options) {
  if (!kuzzleDataCollection) {
    throw new Error('KuzzleRoom: missing parameters');
  }

  kuzzleDataCollection.kuzzle.isValid();

  // Define properties
  Object.defineProperties(this, {
    // read-only properties
    collection: {
      value: kuzzleDataCollection.collection,
      enumerable: true
    },
    kuzzle: {
      value: kuzzleDataCollection.kuzzle,
      enumerable: true
    },
    // writable properties
    filters: {
      value: null,
      enumerable: true,
      writable: true
    },
    headers: {
      value: JSON.parse(JSON.stringify(kuzzleDataCollection.headers)),
      enumerable: true,
      writable: true
    },
    listeningToConnections: {
      value: (options && options.listeningToConnections) ? options.listeningToConnections : false,
      enumerable: true,
      writable: true
    },
    listeningToDisconnections: {
      value: (options && options.listeningToDisconnections) ? options.listeningToDisconnections : false,
      enumerable: true,
      writable: true
    },
    metadata: {
      value: {},
      enumerable: true,
      writable: true
    },
    roomId: {
      value: null,
      enumerable: true,
      writable: true
    },
    subscriptionId: {
      value: null,
      enumerable: true,
      writable: true,
      configurable: true
    },
    subscriptionTimestamp: {
      value: null,
      enumerable: true,
      writable: true
    },
    subscribeToSelf: {
      value: (options && options.subscribeToSelf) ? options.subscribeToSelf : false,
      enumerable: true,
      writable: true
    }
  });

  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this);
  }

  return this;
}

/**
 * Returns the number of other subscriptions on that room.
 *
 * @param {responseCallback} cb - Handles the query response
 */
KuzzleRoom.prototype.count = function (cb) {
  var data;

  this.kuzzle.callbackRequired('KuzzleRoom.count', cb);
  data = this.kuzzle.addHeaders({body: {roomId: this.roomId}}, this.headers);

  this.kuzzle.query(this.collection, 'subscribe', 'count', data, cb);

  return this;
};

/**
 * Renew the subscription using new filters
 *
 * @param {object} filters - Filters in Kuzzle DSL format
 * @param {responseCallback} cb - called for each new notification
 * @param {readyCallback} [ready] - called once the subscription is finished
 */
KuzzleRoom.prototype.renew = function (filters, cb, ready) {
  var
    subscribeQuery,
    self = this;

  this.kuzzle.callbackRequired('KuzzleRoom.renew', cb);
  this.filters = filters;
  this.unsubscribe();
  subscribeQuery = this.kuzzle.addHeaders({body: filters}, this.headers);

  self.kuzzle.query(this.collection, 'subscribe', 'on', subscribeQuery, function (error, response) {
    if (error) {
      throw new Error('Error during Kuzzle subscription: ' + error);
    }

    self.roomId = response.roomId;
    self.subscriptionId = response.roomName;
    self.foo = response.roomName;
    self.subscriptionTimestamp = Date.now();

    self.kuzzle.socket.on(self.roomId, function (data) {
      var
        globalEvent,
        listening;

      if (data.error) {
        return cb(data.error);
      }

      if (data.result.action === 'on' || data.result.action === 'off') {
        if (data.result.action === 'on') {
          globalEvent = 'subscribed';
          listening = self.listeningToConnections;
        } else {
          globalEvent = 'unsubscribed';
          listening = self.listeningToDisconnections;
        }

        if (listening || self.kuzzle.eventListeners[globalEvent].length > 0) {
          self.count(function (countError, countResult) {
            if (countError) {
              if (listening) {
                cb(countError);
              }
              return false;
            }

            data.result.count = countResult;

            if (listening) {
              cb(null, data.result);
            }

            self.kuzzle.eventListeners[globalEvent].forEach(function (listener) {
              listener(self.subscriptionId, data.result);
            });
          });
        }
      } else {
        cb(null, data.result);
      }
    });

    if (ready) {
      if (typeof ready === 'function') {
        ready();
      } else {
        throw new Error('Expected the "ready" argument to be a callback function, got a ' + typeof ready + ' (value: ' + ready + ')');
      }
    }
  });

  return this;
};

/**
 * Unsubscribes from Kuzzle.
 *
 * @return {*} this
 */
KuzzleRoom.prototype.unsubscribe = function () {
  var data;

  if (this.roomId) {
    data = this.kuzzle.addHeaders({requestId: this.subscriptionId}, this.headers);
    this.kuzzle.query(this.collection, 'subscribe', 'off', data);
    this.kuzzle.socket.off(this.roomId);
    this.roomId = null;
    this.subscriptionId = null;
    this.subscriptionTimestamp = null;
  }
};

module.exports = KuzzleRoom;
