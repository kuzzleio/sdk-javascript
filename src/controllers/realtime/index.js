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
      return Promise.reject(new Error('Kuzzle.realtime.count: roomId is required'));
    }

    return this.kuzzle.query({
      controller: 'realtime',
      action: 'count',
      body: {roomId}
    }, options);
  }

  join (roomId, options = {}) {
    if (!roomId) {
      return Promise.reject(new Error('Kuzzle.realtime.join: roomId is required'));
    }

    return this.kuzzle.query({
      controller: 'realtime',
      action: 'join',
      body: {roomId}
    }, options);
  }

  list (options = {}) {
    return this.kuzzle.query({
      controller: 'realtime',
      action: 'list'
    }, options);
  }

  publish (index, collection, body, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.realtime.publish: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.realtime.publish: collection is required'));
    }
    if (!body) {
      return Promise.reject(new Error('Kuzzle.realtime.publish: body is required'));
    }

    const request = {
      index,
      collection,
      body,
      controller: 'realtime',
      action: 'publish'
    };

    return this.kuzzle.query(request, options);
  }

  subscribe (index, collection, body, callback, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.realtime.subscribe: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.realtime.subscribe: collection is required'));
    }
    if (!body) {
      return Promise.reject(new Error('Kuzzle.realtime.subscribe: body is required'));
    }
    if (!callback || typeof callback !== 'function') {
      return Promise.reject(new Error('Kuzzle.realtime.subscribe: a callback function is required'));
    }

    const room = new Room(this.kuzzle, index, collection, body, callback, options);

    return room.subscribe()
      .then(response => {
        if (!this.subscriptions[room.id]) {
          this.subscriptions[room.id] = [];
        }
        this.subscriptions[room.id].push(room);
        return response;
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

    return this.kuzzle.query({
      controller: 'realtime',
      action: 'unsubscribe',
      body: {roomId}
    }, options);
  }

  validate (index, collection, body, options = {}) {
    if (!index) {
      return Promise.reject(new Error('Kuzzle.realtime.publish: index is required'));
    }
    if (!collection) {
      return Promise.reject(new Error('Kuzzle.realtime.publish: collection is required'));
    }
    if (!body) {
      return Promise.reject(new Error('Kuzzle.realtime.publish: body is required'));
    }

    return this.kuzzle.query({
      index,
      collection,
      body,
      controller: 'realtime',
      action: 'validate'
    }, options);
  }

}

module.exports = RealTimeController;
