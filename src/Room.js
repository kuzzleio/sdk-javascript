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
 */
class Room {
  /*
   * @constructor
   * @param {object} collection - an instantiated and valid kuzzle object
   * @param {object} [filters] - Filters in Kuzzle DSL format
   * @param {object} [options] - subscription optional configuration
   */
  constructor(collection, filters, options) {
    // Define properties
    Object.defineProperties(this, {
      // private properties
      channel: {
        value: null,
        writable: true
      },
      doneCallbacks: {
        value: []
      },
      kuzzle: {
        value: collection.kuzzle,
        enumerable: true
      },
      lastRenewal: {
        value: null,
        writable: true
      },
      notifier: {
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
      filters: {
        value: filters ? filters : {},
        enumerable: true,
      },
      // writable properties
      headers: {
        value: JSON.parse(JSON.stringify(collection.headers)),
        enumerable: true,
        writable: true
      },
      roomId: {
        value: null,
        enumerable: true,
        writable: true
      },
      volatile: {
        value: (options && options.volatile) ? options.volatile : {},
        enumerable: true,
        writable: true
      },
      subscribeToSelf: {
        value: options && typeof options.subscribeToSelf === 'boolean' ? options.subscribeToSelf : true,
        enumerable: true,
        writable: true
      }
    });

    // method handled when the subscription request is done:
    Object.defineProperty(this, 'done', {
      value: error => {
        this.error = error;
        this.doneCallbacks.forEach(cb => {
          cb(error, this);
        });
        return this;
      },
      enumerable: false
    });

    if (this.kuzzle.bluebird) {
      return this.kuzzle.bluebird.promisifyAll(this, {
        suffix: 'Promise',
        filter: function (name, func, target, passes) {
          var whitelist = ['count', 'unsubscribe'];

          return passes && whitelist.indexOf(name) !== -1;
        }
      });
    }
  }

  /**
   * Returns the number of other subscriptions on that room.
   *
   * @param {responseCallback} cb - Handles the query response
   */
  count(cb) {
    var data;

    this.kuzzle.callbackRequired('Room.count', cb);

    data = this.kuzzle.addHeaders({body: {roomId: this.roomId}}, this.headers);

    if (this.subscribing) {
      this.queue.push({action: 'count', args: [cb]});
      return;
    }

    if (!this.roomId) {
      throw new Error('Room.count: cannot count subscriptions on an inactive room');
    }

    this.kuzzle.query(this.collection.buildQueryArgs('realtime', 'count'), data, function (err, res) {
      cb(err, res && res.result.count);
    });
  }

  /**
   * Renew the subscription
   *
   * @param {responseCallback} notificationCB - called for each new notification
   * @return {*} this
   */
  renew(notificationCB) {
    var
      now = Date.now();

    /*
      Skip subscription renewal if another one was performed a moment before
     */
    if (this.lastRenewal && (now - this.lastRenewal) <= this.renewalDelay) {
      return this.done(new Error('Subscription already renewed less than ' + this.renewalDelay + 'ms ago'));
    }

    if (this.subscribing) {
      this.queue.push({action: 'renew', args: [notificationCB]});
      return this;
    }

    if (this.notifier) {
      this.unsubscribe();
    } else if (notificationCB && typeof notificationCB === 'function') {
      this.notifier = notificationCB;
    } else {
      throw new Error('Room.renew : a notification callback argument is required');
    }

    this.roomId = null;
    this.error = null;
    this.subscribing = true;
    this.kuzzle.subscribe(this, (error, result) => {
      if (error) {
        if (error.message === 'Not Connected') {
          return this.kuzzle.addListener('connected', () => {
            this.renew();
          });
        }

        this.subscribing = false;
        this.queue = [];
        this.error = new Error('Error during Kuzzle subscription: ' + error.message);
        return this.done(this.error);
      }

      this.subscribing = false;
      this.lastRenewal = now;
      this.roomId = result.roomId;
      this.channel = result.channel;

      this.kuzzle.addListener('networkError', () => {
        this.roomId = null;
      });

      this.kuzzle.addListener('tokenExpired', () => {
        this.renew();
      });

      this.kuzzle.addListener('loginAttempt', data => {
        if (data.success) {
          this.renew();
        }
      });

      this.kuzzle.addListener('reconnected', autoResubscribe => {
        if (autoResubscribe) {
          this.renew();
        }
      });

      dequeue(this);
      this.done(null, this);
    });

    return this;
  }

  /**
   * Unsubscribes from Kuzzle.
   *
   * Stop listening immediately.
   * @param {responseCallback} cb - Handles the query response
   * @return {*} this
   */
  unsubscribe(cb) {
    if (this.subscribing) {
      this.queue.push({action: 'unsubscribe', args: []});
      return this;
    }

    if (this.roomId) {
      this.kuzzle.unsubscribe(this, cb);
      this.roomId = null;
    }

    return this;
  }

  /**
   * Helper function allowing to set headers while chaining calls.
   *
   * If the replace argument is set to true, replace the current headers with the provided content.
   * Otherwise, it appends the content to the current headers, only replacing already existing values
   *
   * @param content - new headers content
   * @param [replace] - default: false = append the content. If true: replace the current headers with tj
   */
  setHeaders(content, replace) {
    this.kuzzle.setHeaders.call(this, content, replace);
    return this;
  }

  /**
   * Registers a callback to be called with a subscription result
   * @param {Function} cb
   */
  onDone(cb) {
    if (this.error || this.roomId) {
      cb(this.error, this);
    }
    else {
      this.doneCallbacks.push(cb);
    }

    return this;
  }
}

/**
 * Dequeue actions performed while subscription was being renewed
 */
function dequeue(room) {
  var element;

  while (room.queue.length > 0) {
    element = room.queue.shift();

    room[element.action].apply(room, element.args);
  }
}

module.exports = Room;
