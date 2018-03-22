class Room {

  /**
   * @param {Kuzzle} kuzzle
   * @param {string} index
   * @param {string} collection
   * @param {object} body
   * @param {function} callback
   * @param {object} options
   */
  constructor (kuzzle, index, collection, body, callback, options = {}) {
    this.kuzzle = kuzzle;
    this.index = index;
    this.collection = collection;
    this.callback = callback;
    this.options = options;

    this.id = null;
    this.channel = null;

    // format complete request from body & options
    this.request = {
      index,
      collection,
      body,
      controller: 'realtime',
      action: 'subscribe'
    };
    for (const opt of ['state', 'scope', 'users', 'volatile']) {
      this.request[opt] = this.options[opt];
      delete this.options[opt];
    }

    this.autoResubscribe = typeof options.autoResubscribe === 'boolean'
      ? options.autoResubscribe
      : kuzzle.autoResubscribe;
    this.subscribeToSelf = typeof options.subscribeToSelf === 'boolean'
      ? options.subscribeToSelf
      : true;

    // force bind for further event listener calls
    this._channelListener = this._channelListener.bind(this);
    this._reSubscribeListener = this._reSubscribeListener.bind(this);
  }

  subscribe () {
    return this.kuzzle.query(this.request, this.options)
      .then(response => {
        this.id = response.roomId;
        this.channel = response.channel;

        // we rely on kuzzle event emitter to not duplicate the listeners here
        this.kuzzle.network.on(this.channel, this._channelListener);

        this.kuzzle.addListener('reconnected', this._reSubscribeListener);

        return response;
      });
  }

  removeListeners () {
    this.kuzzle.removeListener('reconnected', this._reSubscribeListener);

    if (this.channel) {
      this.kuzzle.network.removeListener(this.channel, this._channelListener);
    }
  }

  _channelListener (data) {
    const fromSelf = data.volatile !== undefined && data.volatile.sdkInstanceId === this.kuzzle.network.id;
    if (this.subscribeToSelf || !fromSelf) {
      this.callback(data);
    }
  }

  _reSubscribeListener () {
    if (this.autoResubscribe) {
      return this.subscribe();
    }
  }
}

module.exports = Room;
