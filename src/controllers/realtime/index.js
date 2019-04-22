const
  BaseController = require('../base'),
  Room = require('./room');

const expirationThrottleDelay = 1000;

class RealTimeController extends BaseController {
  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    super(kuzzle, 'realtime');

    this.lastExpirationTimestamp = 0;

    this.subscriptions = {};
  }

  count (roomId, options = {}) {
    if (!roomId) {
      throw new Error('Kuzzle.realtime.count: roomId is required');
    }

    return this.query({
      action: 'count',
      body: {roomId}
    }, options)
      .then(response => response.result.count);
  }

  publish (index, collection, message, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.realtime.publish: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.realtime.publish: collection is required');
    }
    if (!message) {
      throw new Error('Kuzzle.realtime.publish: message is required');
    }

    const request = {
      index,
      collection,
      body: message,
      action: 'publish'
    };

    return this.query(request, options)
      .then(response => response.result.published);
  }

  subscribe (index, collection, filters, callback, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.realtime.subscribe: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.realtime.subscribe: collection is required');
    }
    if (!filters) {
      throw new Error('Kuzzle.realtime.subscribe: filters is required');
    }
    if (!callback || typeof callback !== 'function') {
      throw new Error('Kuzzle.realtime.subscribe: a callback function is required');
    }

    const room = new Room(this, index, collection, filters, callback, options);

    return room.subscribe()
      .then(() => {
        if (!this.subscriptions[room.id]) {
          this.subscriptions[room.id] = [];
        }
        this.subscriptions[room.id].push(room);
        return room.id;
      });
  }

  unsubscribe (roomId, options = {}) {
    if (!roomId) {
      throw new Error('Kuzzle.realtime.unsubscribe: roomId is required');
    }

    const rooms = this.subscriptions[roomId];

    if (!rooms) {
      return Promise.reject(new Error(`not subscribed to ${roomId}`));
    }

    for (const room of rooms) {
      room.removeListeners();
    }
    delete this.subscriptions[roomId];

    return this.query({
      action: 'unsubscribe',
      body: {roomId}
    }, options)
      .then(response => {
        return response.result;
      });
  }

  /**
   * Removes all subscriptions, and emit a "tokenExpired" event
   * (tries to prevent event duplication by throttling it)
   */
  tokenExpired() {
    for (const roomId of Object.keys(this.subscriptions)) {
      this.subscriptions[roomId].forEach(room => room.removeListeners());
    }

    this.subscriptions = {};
    this.kuzzle.jwt = undefined;

    const now = Date.now();
    if ((now - this.lastExpirationTimestamp) > expirationThrottleDelay) {
      this.lastExpirationTimestamp = now;
      this.kuzzle.emit('tokenExpired');
    }
  }
}

module.exports = RealTimeController;
