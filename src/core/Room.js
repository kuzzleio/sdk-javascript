"use strict";

class Room {
  /**
   * @param {RealtimeController} controller
   * @param {string} index
   * @param {string} collection
   * @param {object} body
   * @param {function} callback
   * @param {object} options
   */
  constructor(controller, index, collection, body, callback, options = {}) {
    Reflect.defineProperty(this, "_kuzzle", {
      value: controller.kuzzle,
    });
    this.controller = controller;
    this.index = index;
    this.collection = collection;
    this.callback = callback;
    this.options = options;

    this.id = null;
    this.channel = null;

    // format complete request from body & options
    this.request = {
      action: "subscribe",
      body,
      collection,
      controller: "realtime",
      index,
      scope: this.options.scope,
      state: this.options.state,
      users: this.options.users,
      volatile: this.options.volatile,
    };

    this.autoResubscribe =
      typeof options.autoResubscribe === "boolean"
        ? options.autoResubscribe
        : this.kuzzle.autoResubscribe;
    this.subscribeToSelf =
      typeof options.subscribeToSelf === "boolean"
        ? options.subscribeToSelf
        : true;

    // force bind for further event listener calls
    this._channelListener = this._channelListener.bind(this);
  }

  get kuzzle() {
    return this._kuzzle;
  }

  subscribe() {
    return this.kuzzle.query(this.request, this.options).then((response) => {
      this.id = response.result.roomId;
      this.channel = response.result.channel;

      // we rely on kuzzle event emitter to not duplicate the listeners here
      this.kuzzle.protocol.on(this.channel, this._channelListener);

      return response;
    });
  }

  removeListeners() {
    if (this.channel) {
      this.kuzzle.protocol.removeListener(this.channel, this._channelListener);
    }
  }

  _channelListener(data) {
    // intercept token expiration messages and relay them to kuzzle
    if (data.type === "TokenExpired") {
      return this.kuzzle.tokenExpired();
    }

    const fromSelf =
      data.volatile && data.volatile.sdkInstanceId === this.kuzzle.protocol.id;

    if (this.subscribeToSelf || !fromSelf) {
      try {
        const callbackResponse = this.callback(data);

        if (
          callbackResponse !== null &&
          typeof callbackResponse === "object" &&
          typeof callbackResponse.then === "function" &&
          typeof callbackResponse.catch === "function"
        ) {
          callbackResponse.catch((error) => {
            this.kuzzle.emit("callbackError", { error, notification: data });
          });
        }
      } catch (error) {
        this.kuzzle.emit("callbackError", { error, notification: data });
      }
    }
  }
}

module.exports = Room;
