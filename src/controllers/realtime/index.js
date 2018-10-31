const
  Room = require('./room'),
  _kuzzle = Symbol();

class RealTimeController {

  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    this[_kuzzle] = kuzzle;

    this.subscriptions = {
      filters: {},
      channels: {}
    };
  }

  get kuzzle () {
    return this[_kuzzle];
  }

  count (roomId, options = {}) {
    if (!roomId) {
      throw new Error('Kuzzle.realtime.count: roomId is required');
    }

    return this.kuzzle.query({
      controller: 'realtime',
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
      controller: 'realtime',
      action: 'publish'
    };

    return this.kuzzle.query(request, options)
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

    const room = new Room(this.kuzzle, index, collection, filters, callback, options);

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

    return this.kuzzle.query({
      controller: 'realtime',
      action: 'unsubscribe',
      body: {roomId}
    }, options)
      .then(response => {
        return response.result;
      });
  }
}

module.exports = RealTimeController;
