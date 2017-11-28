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

    let _roomId = null;

    // Define properties
    Object.defineProperties(this, {
      // private properties
      roomstate: {
        // Values can be: inactive, subscribing, active
        value: 'inactive',
        writable: true
      },
      kuzzle: {
        value: collection.kuzzle
      },
      isListening: {
        value: false,
        writable: true
      },
      //listeners
      resubscribe: {
        value: () => {
          this.roomstate = 'inactive';
          this.error = null;
          this.subscribe();
        }
      },
      deactivate: {
        value: () => {
          this.roomstate = 'inactive';
        }
      },
      resubscribeConditional: {
        value: () => {
          this.roomstate = 'inactive';
          
          if (this.autoResubscribe) {
            this.subscribe();
          }
        }
      },
      //enumerables
      channel: {
        value: null,
        writable: true,
        enumerable: true
      },
      scope: {
        value: options && options.scope ? options.scope : 'all',
        enumerable: true
      },
      state: {
        value: options && options.state ? options.state : 'done',
        enumerable: true
      },
      users: {
        value: options && options.users ? options.users : 'none',
        enumerable: true
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
      roomId: {
        enumerable: true,
        get: () => _roomId,
        set: value => {
          if (!_roomId) {
            _roomId = value;
          }
        }
      },
      // writable properties
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
        enumerable: true
      }
    });

    if (this.kuzzle.bluebird) {
      return this.kuzzle.bluebird.promisifyAll(this, {
        suffix: 'Promise',
        filter: function (name, func, target, passes) {
          const whitelist = ['count', 'subscribe', 'unsubscribe', 'onDone'];

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

    const data = {body: {roomId: this.roomId}};

    if (this.roomstate !== 'active') {
      return cb(new Error('Cannot count subscriptions on an non-active room'));
    }

    this.kuzzle.query(this.collection.buildQueryArgs('realtime', 'count'), data, function (err, res) {
      cb(err, res && res.result.count);
    });
  }

  /**
   * Subscribes to Kuzzle 
   * (do nothing if a subscription is active or underway)
   * 
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
    if (this.roomstate === 'active') {
      this.emit('done', null, this);
      return this;
    }

    // If the room is already subscribing, wait for its activation.
    if (this.roomstate === 'subscribing') {
      return this;
    }

    // If the room is still inactive, start the subscription.
    this.error = null;
    this.roomstate = 'subscribing';

    this.kuzzle.subscribe(this, options, (error, result) => {
      if (error) {
        if (error.message === 'Not Connected') {
          return this.kuzzle.once('connected', this.resubscribe);
        }

        this.roomstate = 'inactive';
        this.error = new Error('Error during Kuzzle subscription: ' + error.message);
        this.emit('done', this.error);
        return null;
      }

      this.roomId = result.roomId;
      this.channel = result.channel;
      this.roomstate = 'active';

      if (!this.isListening) {
        this.kuzzle.addListener('disconnected', this.deactivate);
        this.kuzzle.addListener('tokenExpired', this.deactivate);
        this.kuzzle.addListener('reconnected', this.resubscribeConditional);
        this.isListening = true;
      }

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

    if (this.roomstate === 'subscribing') {
      if (cb) {
        cb(new Error('Cannot unsubscribe a room while a subscription attempt is underway'));
      }

      return this;
    }

    if (this.isListening) {
      this.kuzzle.removeListener('disconnected', this.deactivate);
      this.kuzzle.removeListener('tokenExpired', this.deactivate);
      this.kuzzle.removeListener('reconnected', this.resubscribeConditional);
      this.isListening = false;
    }

    if (this.roomstate === 'active') {
      this.kuzzle.unsubscribe(this, options, cb);
    }
    else if (cb) {
      cb(null, this.roomId);
    }

    this.roomstate = 'inactive';

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
   * Registers a callback to be called with a subscription result
   * @param {Function} cb
   */
  onDone(cb) {
    if (!cb || typeof cb !== 'function') {
      throw new Error('Room.onDone: a callback argument is required.');
    }

    if (this.error) {
      cb(this.error);
    }
    else if (this.roomstate === 'active') {
      cb(null, this);
    }
    else {
      this.once('done', cb);
    }

    return this;
  }
}

module.exports = Room;
