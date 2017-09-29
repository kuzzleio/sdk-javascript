'use strict';

const
  KuzzleEventEmitter = require('./eventEmitter');

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
class Room extends KuzzleEventEmitter {
  /*
   * @constructor
   * @param {object} collection - an instantiated and valid kuzzle object
   * @param {object} [filters] - Filters in Kuzzle DSL format
   * @param {object} [options] - subscription optional configuration
   */
  constructor(collection, filters, options) {
    super();

    // Define properties
    Object.defineProperties(this, {
      // private properties
      channel: {
        value: null,
        writable: true
      },
      kuzzle: {
        value: collection.kuzzle,
        enumerable: true
      },
      lastRenewal: {
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
      },
      autoResubscribe: {
        value: options && typeof options.autoResubscribe === 'boolean' ? options.autoResubscribe : collection.kuzzle.autoResubscribe,
        enumerable: true,
        writable: true
      }
    });

    if (this.kuzzle.bluebird) {
      return this.kuzzle.bluebird.promisifyAll(this, {
        suffix: 'Promise',
        filter: function (name, func, target, passes) {
          const whitelist = ['count', 'renew', 'subscribe', 'unsubscribe', 'onDone'];

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
    this.kuzzle.callbackRequired('Room.count', cb);

    const data = this.kuzzle.addHeaders({body: {roomId: this.roomId}}, this.headers);

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
   * @param {responseCallback} cb - called when the subscription is ready.
   * @return {*} this
   */
  renew(cb) {
    /*
      Skip subscription renewal if another one was performed a moment before
     */
    const now = Date.now();
    if (this.lastRenewal && (now - this.lastRenewal) <= this.renewalDelay) {
      this.error = new Error('Subscription already renewed less than ' + this.renewalDelay + 'ms ago');
      if (cb) {
        cb(this.error);
      }
      this.emit('done', this.error);
      return this;
    }

    if (this.subscribing) {
      this.queue.push({action: 'renew', args: []});
      return this;
    }

    this.unsubscribe();
    return this.subscribe(cb);
  }

  /**
   * Subscribes to Kuzzle.
   *
   * (Do not renew the subscription if the room is already subscribing).
   * @param options
   * @param {responseCallback} cb - called when the subscription is ready.
   * @return {*} this
   */
  subscribe(options, cb) {
    if (!cb && typeof options === 'function') {
      cb = options;
      options = null;
    }

    if (cb) {
      this.onDone(cb);
    }

    // If the room subscription is active, just call the callback.
    if (this.roomId) {
      this.emit('done', null, this);
      return this;
    }

    // If the room is already subscribing, wait for its activation.
    if (this.subscribing) {
      return this;
    }


    // If the room is still inactive, start the subscription.
    this.error = null;
    this.subscribing = true;
    this.kuzzle.subscribe(this, options, (error, result) => {
      if (error) {
        if (error.message === 'Not Connected') {
          return this.kuzzle.addListener('connected', () => {
            this.subscribing = false;
            this.subscribe();
          });
        }

        this.subscribing = false;
        this.queue = [];
        this.error = new Error('Error during Kuzzle subscription: ' + error.message);
        this.emit('done', this.error);
        return this;
      }

      this.subscribing = false;
      this.lastRenewal = Date.now();
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

      this.kuzzle.addListener('reconnected', () => {
        if (this.autoResubscribe) {
          this.renew();
        }
      });

      dequeue(this);
      this.emit('done', null, this);
    });

    return this;
  }

  /**
   * Unsubscribes from Kuzzle.
   *
   * Stop listening immediately.
   * @param options
   * @param {responseCallback} cb - Handles the query response
   * @return {*} this
   */
  unsubscribe(options, cb) {
    if (!cb && typeof options === 'function') {
      cb = options;
      options = null;
    }

    if (this.subscribing) {
      this.queue.push({action: 'unsubscribe', args: [options, cb]});
      return this;
    }

    if (this.roomId) {
      this.kuzzle.unsubscribe(this, options, cb);
      this.roomId = null;
    }

    return this;
  }

  /**
   * Notify listeners
   *
   * @param {Object} data - data to send. Must contain `data.type` as eventName.
   * @return {*} this
   */
  notify(data) {
    if (data.type === undefined) {
      throw new Error('Room.notify: argument must match {type: <document|user>}');
    }
    if (!data.fromSelf || this.subscribeToSelf) {
      this.emit(data.type, data);
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
    if (!cb || typeof cb !== 'function') {
      throw new Error('Room.onDone: as callback argument is required.');
    }

    if (this.error) {
      cb(this.error);
    }
    else if (this.roomId) {
      cb(null, this);
    }
    else {
      this.once('done', cb);
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
