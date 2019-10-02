const
  BaseController = require('../base'),
  Room = require('./room');


class RealTimeController extends BaseController {
  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    super(kuzzle, 'realtime');

    this.subscriptions = {};
    this.subscriptionsOff = {};
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

  // called on network error or disconnection
  disconnected () {
    for (const roomId of Object.keys(this.subscriptions)) {
      for (const room of this.subscriptions[roomId]) {
        room.removeListeners();

        if (room.autoResubscribe) {
          if (!this.subscriptionsOff[roomId]) {
            this.subscriptionsOff[roomId] = [];
          }
          this.subscriptionsOff[roomId].push(room);
        }
      }

      delete this.subscriptions[roomId];
    }
  }

  /**
   * Called on kuzzle reconnection.
   * Resubscribe to eligible disabled rooms.
   */
  reconnected () {
    for (const roomId of Object.keys(this.subscriptionsOff)) {
      for (const room of this.subscriptionsOff[roomId]) {
        if (!this.subscriptions[roomId]) {
          this.subscriptions[roomId] = [];
        }
        this.subscriptions[roomId].push(room);

        room.subscribe()
          .catch(() => this.kuzzle.emit('discarded', {request: room.request}));
      }

      delete this.subscriptionsOff[roomId];
    }
  }

  /**
   * Removes all subscriptions.
   */
  tokenExpired() {
    for (const roomId of Object.keys(this.subscriptions)) {
      this.subscriptions[roomId].forEach(room => room.removeListeners());
    }

    this.subscriptions = {};
    this.subscriptionsOff = {};
  }

}

module.exports = RealTimeController;
