var
  uuidv4 = require('uuid/v4'),
  Document = require('./Document');

/**
 * This is a global callback pattern, called by all asynchronous functions of the Kuzzle object.
 *
 * @callback responseCallback
 * @param {Object} err - Error object, NULL if the query is successful
 * @param {Object} [data] - The content of the query response
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
 * @param {object} collection - an instantiated and valid kuzzle object
 * @param {object} [options] - subscription optional configuration
 * @constructor
 */
function Room(collection, options) {
  // Define properties
  Object.defineProperties(this, {
    // private properties
    callback: {
      value: null,
      writable: true
    },
    channel: {
      value: null,
      writable: true
    },
    id: {
      value: uuidv4()
    },
    lastRenewal: {
      value: null,
      writable: true
    },
    notifier: {
      value: null,
      writable: true
    },
    onDoneCB: {
      value: null,
      writable: true
    },
    queue: {
      value: [],
      writable: true
    },
    // Delay before allowing a subscription renewal
    renewalDelay: {
      value: 500
    },
    scope: {
      value: options && options.scope ? options.scope : 'all'
    },
    state: {
      value: options && options.state ? options.state : 'done'
    },
    subscribing: {
      value: false,
      writable: true
    },
    users: {
      value: options && options.users ? options.users : 'none'
    },
    // read-only properties
    collection: {
      value: collection,
      enumerable: true
    },
    kuzzle: {
      value: collection.kuzzle,
      enumerable: true
    },
    // writable properties
    filters: {
      value: null,
      enumerable: true,
      writable: true
    },
    headers: {
      value: JSON.parse(JSON.stringify(collection.headers)),
      enumerable: true,
      writable: true
    },
    volatile: {
      value: (options && options.volatile) ? options.volatile : {},
      enumerable: true,
      writable: true
    },
    roomId: {
      value: null,
      enumerable: true,
      writable: true
    },
    subscribeToSelf: {
      value: options && typeof options.subscribeToSelf === 'boolean' ? options.subscribeToSelf : true,
      enumerable: true,
      writable: true
    }
  });

  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['count'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

  return this;
}

/**
 * Returns the number of other subscriptions on that room.
 *
 * @param {responseCallback} cb - Handles the query response
 */
Room.prototype.count = function (cb) {
  var data;

  this.kuzzle.callbackRequired('Room.count', cb);

  data = this.kuzzle.addHeaders({body: {roomId: this.roomId}}, this.headers);

  if (!isReady.call(this)) {
    this.queue.push({action: 'count', args: [cb]});
    return;
  }

  if (!this.roomId) {
    throw new Error('Room.count: cannot count subscriptions on an inactive room');
  }

  this.kuzzle.query(this.collection.buildQueryArgs('realtime', 'count'), data, function (err, res) {
    cb(err, res && res.result.count);
  });
};

/**
 * Renew the subscription using new filters
 *
 * @param {object} [filters] - Filters in Kuzzle DSL format
 * @param {responseCallback} notificationCB - called for each new notification
 * @param {responseCallback} [cb] - handles the query response
 */
Room.prototype.renew = function (filters, notificationCB, cb) {
  var
    self = this,
    now = Date.now(),
    subscribeQuery = {
      scope: self.scope,
      state: self.state,
      users: self.users
    };

  if (typeof filters === 'function') {
    cb = notificationCB;
    notificationCB = filters;
    filters = null;
  }

  if (!cb) {
    cb = self.onDoneCB;
  }

  self.kuzzle.callbackRequired('Room.renew', notificationCB);

  /*
    Skip subscription renewal if another one was performed a moment before
   */
  if (self.lastRenewal && (now - self.lastRenewal) <= self.renewalDelay) {
    return cb && cb(new Error('Subscription already renewed less than ' + self.renewalDelay + 'ms ago'));
  }

  if (filters) {
    self.filters = filters;
  }

  /*
   if not yet connected, register itself to the subscriptions list and wait for the
   main Kuzzle object to renew once online
    */
  if (self.kuzzle.state !== 'connected') {
    self.callback = notificationCB;
    self.onDoneCB = cb;
    self.kuzzle.subscriptions.pending[self.id] = self;
    return;
  }

  if (self.subscribing) {
    self.queue.push({action: 'renew', args: [filters, notificationCB, cb]});
    return;
  }

  self.unsubscribe();
  self.roomId = null;
  self.subscribing = true;
  self.callback = notificationCB;
  self.onDoneCB = cb;
  self.kuzzle.subscriptions.pending[self.id] = self;

  subscribeQuery.body = self.filters;
  subscribeQuery = self.kuzzle.addHeaders(subscribeQuery, self.headers);

  self.kuzzle.query(self.collection.buildQueryArgs('realtime', 'subscribe'), subscribeQuery, {volatile: self.volatile}, function (error, response) {
    delete self.kuzzle.subscriptions.pending[self.id];
    self.subscribing = false;

    if (error) {
      self.queue = [];
      return cb && cb(new Error('Error during Kuzzle subscription: ' + error.message));
    }

    self.lastRenewal = now;
    self.roomId = response.result.roomId;
    self.channel = response.result.channel;

    if (!self.kuzzle.subscriptions[self.roomId]) {
      self.kuzzle.subscriptions[self.roomId] = {};
    }

    self.kuzzle.subscriptions[self.roomId][self.id] = self;

    self.notifier = notificationCallback.bind(self);
    self.kuzzle.network.on(self.channel, self.notifier);

    dequeue.call(self);
    cb && cb(null, self);
  });
};

/**
 * Unsubscribes from Kuzzle.
 *
 * Stop listening immediately. If there is no listener left on that room, sends an unsubscribe request to Kuzzle, once
 * pending subscriptions reaches 0, and only if there is still no listener on that room.
 * We wait for pending subscriptions to finish to avoid unsubscribing while another subscription on that room is
 *
 * @return {*} this
 */
Room.prototype.unsubscribe = function () {
  var
    self = this,
    room = self.roomId,
    interval;

  if (!isReady.call(this)) {
    self.queue.push({action: 'unsubscribe', args: []});
    return self;
  }

  if (room) {
    self.kuzzle.network.off(self.channel, this.notifier);

    if (Object.keys(self.kuzzle.subscriptions[room]).length === 1) {
      delete self.kuzzle.subscriptions[room];

      if (Object.keys(self.kuzzle.subscriptions.pending).length === 0) {
        self.kuzzle.query(self.collection.buildQueryArgs('realtime', 'unsubscribe'), {body: {roomId: room}});
      } else {
        interval = setInterval(function () {
          if (Object.keys(self.kuzzle.subscriptions.pending).length === 0) {
            if (!self.kuzzle.subscriptions[room]) {
              self.kuzzle.query(self.collection.buildQueryArgs('realtime', 'unsubscribe'), {body: {roomId: room}});
            }
            clearInterval(interval);
          }
        }, 100);
      }
    } else {
      delete self.kuzzle.subscriptions[room][self.id];
    }

    self.roomId = null;
  }

  return self;
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
Room.prototype.setHeaders = function (content, replace) {
  this.kuzzle.setHeaders.call(this, content, replace);
  return this;
};

/**
 * Callback called by the network handler when a message is sent to the subscribed room ID
 * Calls the registered callback if the notification passes the subscription filters
 *
 * @param {object} data - data
 * @returns {*}
 */
function notificationCallback (data) {
  if (data.type === 'TokenExpired') {
    this.kuzzle.jwtToken = undefined;
    return this.kuzzle.emitEvent('tokenExpired');
  }

  if (data.type === 'document') {
    data.document = new Document(this.collection, data.result._id, data.result._source, data.result._meta);
    delete data.result;
  }

  if (this.subscribeToSelf || !data.volatile || data.volatile.sdkInstanceId !== this.kuzzle.id) {
    this.callback(null, data);
  }
}


/**
 * Dequeue actions performed while subscription was being renewed
 */
function dequeue () {
  var element;

  while (this.queue.length > 0) {
    element = this.queue.shift();

    this[element.action].apply(this, element.args);
  }
}

function isReady() {
  return this.kuzzle.state === 'connected' && !this.subscribing;
}

module.exports = Room;
