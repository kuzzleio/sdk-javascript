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

  list (options = {}) {
    return this.kuzzle.query({
      controller: 'realtime',
      action: 'list'
    }, options)
      .then(response => response.result);
  }

  publish (index, collection, body, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.realtime.publish: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.realtime.publish: collection is required');
    }
    if (!body) {
      throw new Error('Kuzzle.realtime.publish: body is required');
    }

    const request = {
      index,
      collection,
      body,
      controller: 'realtime',
      action: 'publish'
    };

    return this.kuzzle.query(request, options)
      .then(response => response.result);
  }

  subscribe (index, collection, body, callback, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.realtime.subscribe: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.realtime.subscribe: collection is required');
    }
    if (!body) {
      throw new Error('Kuzzle.realtime.subscribe: body is required');
    }
    if (!callback || typeof callback !== 'function') {
      throw new Error('Kuzzle.realtime.subscribe: a callback function is required');
    }

    const room = new Room(this.kuzzle, index, collection, body, callback, options);

    return room.subscribe()
      .then(response => {
        if (!this.subscriptions[room.id]) {
          this.subscriptions[room.id] = [];
        }
        this.subscriptions[room.id].push(room);
        return response.result;
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

  validate (index, collection, body, options = {}) {
    if (!index) {
      throw new Error('Kuzzle.realtime.validate: index is required');
    }
    if (!collection) {
      throw new Error('Kuzzle.realtime.validate: collection is required');
    }
    if (!body) {
      throw new Error('Kuzzle.realtime.validate: body is required');
    }

    return this.kuzzle.query({
      index,
      collection,
      body,
      controller: 'realtime',
      action: 'validate'
    }, options)
      .then(response => response.result);
  }

}

module.exports = RealTimeController;
