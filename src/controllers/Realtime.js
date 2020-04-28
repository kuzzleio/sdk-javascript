const BaseController = require('./Base');
const Room = require('../core/Room');


class RealTimeController extends BaseController {
  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    super(kuzzle, 'realtime');

    this.subscriptions = {};
    this.subscriptionsOff = {};

    this.kuzzle.on('tokenExpired', () => this.tokenExpired());
  }

  count (roomId, options = {}) {
    return this.query({
      action: 'count',
      body: {roomId}
    }, options)
      .then(response => response.result.count);
  }

  publish (index, collection, message, options = {}) {
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
