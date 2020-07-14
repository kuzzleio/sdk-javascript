const { BaseController } = require('./Base');
const Room = require('../core/Room');


class RealtimeController extends BaseController {
  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    super(kuzzle, 'realtime');

    this.subscriptions = new Map();
    this.subscriptionsOff = new Map();

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
      action: 'publish',
      _id: options._id
    };

    return this.query(request, options)
      .then(response => response.result.published);
  }

  subscribe (index, collection, filters, callback, options = {}) {
    const room = new Room(this, index, collection, filters, callback, options);

    return room.subscribe()
      .then(() => {
        if (!this.subscriptions.has(room.id)) {
          this.subscriptions.set(room.id, []);
        }
        this.subscriptions.get(room.id).push(room);
        return room.id;
      });
  }

  unsubscribe (roomId, options = {}) {
    const request = {
      action: 'unsubscribe',
      body: { roomId }
    };

    return this.query(request, options)
      .then(response => {
        const rooms = this.subscriptions.get(roomId);

        if (rooms) {
          for (const room of rooms) {
            room.removeListeners();
          }

          this.subscriptions.delete(roomId);
        }

        return response.result;
      });
  }

  // called on network error or disconnection
  disconnected () {
    for (const roomId of this.subscriptions.keys()) {
      for (const room of this.subscriptions.get(roomId)) {
        room.removeListeners();

        if (room.autoResubscribe) {
          if (!this.subscriptionsOff.has(roomId)) {
            this.subscriptionsOff.set(roomId, []);
          }
          this.subscriptionsOff.get(roomId).push(room);
        }
      }

      this.subscriptions.delete(roomId);
    }
  }

  /**
   * Called on kuzzle reconnection.
   * Resubscribe to eligible disabled rooms.
   */
  reconnected () {
    for (const roomId of this.subscriptionsOff.keys()) {
      for (const room of this.subscriptionsOff.get(roomId)) {
        if (!this.subscriptions.has(roomId)) {
          this.subscriptions.set(roomId, []);
        }
        this.subscriptions.get(roomId).push(room);

        room.subscribe()
          .catch(() => this.kuzzle.emit('discarded', {request: room.request}));
      }

      this.subscriptionsOff.delete(roomId);
    }
  }

  /**
   * Removes all subscriptions.
   */
  tokenExpired() {
    for (const roomId of this.subscriptions.keys()) {
      for (const room of this.subscriptions.get(roomId)) {
        room.removeListeners();
      }
    }

    this.subscriptions = new Map();
    this.subscriptionsOff = new Map();
  }

}

module.exports = { RealtimeController };
