/**
 * This is a global callback pattern, called by all asynchronous functions of the Kuzzle object.
 *
 * @callback responseCallback
 * @param {Object} err - Error object, NULL if the query is successful
 * @param {Object} data - The content of the query response
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
    // private properties
    queue: {
      value: [],
      writable: true
    },
    subscribing: {
      value: false,
      writable: true
    },
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
    listenToConnections: {
      value: options ? options.listenToConnections : false,
      enumerable: true,
      writable: true
    },
    listenToDisconnections: {
      value: options ? options.listenToDisconnections : false,
      enumerable: true,
      writable: true
    },
    metadata: {
      value: (options && options.metadata) ? options.metadata : {},
      enumerable: true,
      writable: true
    },
    roomId: {
      value: null,
      enumerable: true,
      writable: true
    },
    subscribeToSelf: {
      value: options ? options.subscribeToSelf : false,
      enumerable: true,
      writable: true
    }
  });

  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this, {suffix: 'Promise'});
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

  if (this.subscribing) {
    this.queue.push({action: 'count', args: [cb]});
    return this;
  }

  this.kuzzle.query(this.collection, 'subscribe', 'count', data, function (err, res) {
    if (err) {
      return cb(err);
    }

    cb(null, res);
  });

  return this;
};

/**
 * Renew the subscription using new filters
 *
 * @param {object} [filters] - Filters in Kuzzle DSL format
 * @param {responseCallback} cb - called for each new notification
 */
KuzzleRoom.prototype.renew = function (filters, cb) {
  var
    subscribeQuery,
    self = this;

  if (!cb && filters && typeof filters === 'function') {
    cb = filters;
    filters = null;
  }

  if (this.subscribing) {
    this.queue.push({action: 'renew', args: [filters, cb]});
    return this;
  }

  this.kuzzle.callbackRequired('KuzzleRoom.renew', cb);

  if (filters) {
    this.filters = filters;
  }

  this.unsubscribe();
  subscribeQuery = this.kuzzle.addHeaders({body: filters}, this.headers);

  this.subscribing = true;

  self.kuzzle.query(this.collection, 'subscribe', 'on', subscribeQuery, {metadata: this.metadata}, function (error, response) {
    if (error) {
      throw new Error('Error during Kuzzle subscription: ' + error.message);
    }

    self.roomId = response.roomId;
    self.subscribing = false;
    self.dequeue();

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
          listening = self.listenToConnections;
        } else {
          globalEvent = 'unsubscribed';
          listening = self.listenToDisconnections;
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
      } else if (self.kuzzle.requestHistory[data.result.requestId]) {
        if (self.subscribeToSelf) {
          cb(null, data.result);
        }
        delete self.kuzzle.requestHistory[data.result.requestId];
      } else {
        cb(null, data.result);
      }
    });
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

  if (this.subscribing) {
    this.queue.push({action: 'unsubscribed', args: []});
    return this;
  }

  if (this.roomId) {
    data = this.kuzzle.addHeaders({body: {roomId: this.roomId}}, this.headers);
    this.kuzzle.query(this.collection, 'subscribe', 'off', data);
    this.kuzzle.socket.off(this.roomId);
    this.roomId = null;
  }

  return this;
};

/**
 * Helper function allowing to set headers while chaining calls.
 *
 * If the replace argument is set to true, replace the current headers with the provided content.
 * Otherwise, it appends the content to the current headers, only replacing already existing values
 *
 * @param content - new headers content
 * @param [replace] - default: false = append the content. If true: replace the current headers with tj
 */
KuzzleRoom.prototype.setHeaders = function (content, replace) {
  this.kuzzle.setHeaders.call(this, content, replace);
  return this;
};

/**
 * Dequeue actions performed while subscription was being renewed
 */
KuzzleRoom.prototype.dequeue = function () {
  var element;

  while (this.queue.length > 0) {
    element = this.queue.shift();

    this[element.action].apply(this, element.args);
  }
};

module.exports = KuzzleRoom;
