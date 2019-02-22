class Room {

  /**
   * @param {RealTimeController} controller
   * @param {string} index
   * @param {string} collection
   * @param {object} body
   * @param {function} callback
   * @param {object} options
   */
  constructor (controller, index, collection, body, callback, options = {}) {
    this.controller = controller;
    this.kuzzle = controller.kuzzle;
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
      : this.kuzzle.autoResubscribe;
    this.subscribeToSelf = typeof options.subscribeToSelf === 'boolean'
      ? options.subscribeToSelf
      : true;

    for (const opt of ['autoResubscribe', 'subscribeToSelf']) {
      delete this.options[opt];
    }

    // force bind for further event listener calls
    this._channelListener = this._channelListener.bind(this);
    this._reSubscribeListener = this._reSubscribeListener.bind(this);
  }

  subscribe () {
    return this.kuzzle.query(this.request, this.options)
      .then(response => {
        this.id = response.result.roomId;
        this.channel = response.result.channel;

        // we rely on kuzzle event emitter to not duplicate the listeners here
        this.kuzzle.protocol.on(this.channel, this._channelListener);

        this.kuzzle.addListener('reconnected', this._reSubscribeListener);

        return response;
      });
  }

  removeListeners () {
    this.kuzzle.removeListener('reconnected', this._reSubscribeListener);

    if (this.channel) {
      this.kuzzle.protocol.removeListener(this.channel, this._channelListener);
    }
  }

  _channelListener (data) {
    // intercept token expiration messages and relay them to the parent
    // controller
    if (data.type === 'TokenExpired') {
      return this.controller.tokenExpired();
    }

    const fromSelf =
      data.volatile && data.volatile.sdkInstanceId === this.kuzzle.protocol.id;

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
