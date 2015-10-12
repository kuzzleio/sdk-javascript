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
 * @param {object} kuzzle - an instantiated and valid kuzzle object
 * @param {object} filters - set of filters to subscribe to
 * @param {responseCallback} callback - callback to call every time a notification is received
 * @param {object} [options] - subscription optional configuration
 * @constructor
 */
function KuzzleRoom(kuzzle, filters, callback, options) {
  var self = this;

  if (!kuzzle || !filters || !callback) {
    throw new Error('KuzzleRoom: missing parameters');
  }

  kuzzle.isValid();

  // Define properties
  Object.defineProperties(this, {
    // private properties
    callback: {
      value: callback,
      writable: true
    },
    // read-only properties
    kuzzle: {
      value: kuzzle,
      enumerable: true
    },
    // writable properties
    filters: {
      value: filters,
      enumerable: true,
      writable: true,
      set: function (f) {
        return self.renew(f);
      }
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
      writable: true
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

  // Subscribe to Kuzzle using the provided filters
  this.renew(filters);
}

/**
 * Returns the number of other subscriptions on that room.
 *
 * @param {responseCallback} cb - Handles the query response
 */
KuzzleRoom.prototype.count = function (cb) {
  this.kuzzle.callbackRequired('KuzzleRoom.count', cb);

  this.kuzzle.query(null, 'subscribe', 'count', {body: {roomId: this.subscriptionID}}, cb);

  return this;
};

/**
 * Renew the subscription using new filters
 *
 * @param {object} filters - Filters in Kuzzle DSL format
 * @param {responseCallback} [cb] - called for each new notification
 */
KuzzleRoom.prototype.renew = function (filters, cb) {
  var self = this;

  if (cb) {
    this.callback = cb;
  }

  this.unsubscribe();

  self.kuzzle.query(null, 'subscribe', 'on', {body: filters}, function (error, response) {
    if (error) {
      throw new Error('Error during Kuzzle subscription: ' + error);
    }

    self.roomId = response.result.roomId;
    self.susbcriptionId = response.result.roomName;
    self.subscriptionTimestamp = Date.now();

    self.kuzzle.socket.on(self.roomId, function (err, data) {
      var
        globalEvent,
        listening;

      if (err) {
        return self.callback(err);
      }

      if (data.action === 'on' || data.action === 'off') {
        if (data.action === 'on') {
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
                self.callback(countError);
              }
              return false;
            }

            data.count = countResult;

            if (listening) {
              self.callback(null, data);
            }

            self.kuzzle.eventListeners[globalEvent].forEach(function (listener) {
              listener(self.subscriptionId, data);
            });
          });
        }
      } else {
        self.callback(null, data);
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
  if (this.roomId) {
    this.kuzzle.socket.off(this.roomId);
    this.roomId = null;
    this.subscriptionId = null;
    this.subscriptionTimestamp = null;
  }

  return this;
};

module.exports = KuzzleRoom;
