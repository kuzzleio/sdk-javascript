'use strict';

const
  RTWrapper = require('./abstract/realtime');

class SocketIO extends RTWrapper {

  constructor(host, options) {
    super(host, options);

    this.socket = null;
    this.forceDisconnect = false;
    this.eventsWrapper = {};
  }

  /**
   * Connect to the SocketIO server
   */
  connect() {
    super.connect();

    this.socket = window.io((this.ssl ? 'https://' : 'http://') + this.host + ':' + this.port, {
      reconnection: this.autoReconnect,
      reconnectionDelay: this.reconnectionDelay,
      forceNew: true
    });

    this.socket.on('connect', () => this.clientConnected());
    this.socket.on('connect_error', error => this.clientNetworkError(error));

    this.socket.on('disconnect', () => {
      if (this.forceDisconnect) {
        this.clientDisconnected();
      } else {
        const error = new Error('An error occurred, kuzzle may not be ready yet');
        error.status = 500;

        this.clientNetworkError(error);
      }

      this.forceDisconnect = false;
    });
  }

  /**
   * Registers a callback on an event.
   *
   * @param {string} event
   * @param {function} callback
   */
  addListener(event, callback, once = false) {
    this._addEventWrapper(event, callback, once);
    super.addListener(event, callback, once);

    return this;
  }

  prependListener(event, callback, once = false) {
    this._addEventWrapper(event, callback, once);
    return super.prependListener(event, callback, once);
  }

  /**
   * Unregisters a callback from an event.
   *
   * @param {string} event
   * @param {function} callback
   */
  removeListener(event, callback) {
    if (this.eventsWrapper[event]) {
      this.eventsWrapper[event].listeners.delete(callback);

      if (this.eventsWrapper[event].listeners.size === 0) {
        this.socket.off(event, this.eventsWrapper[event].wrapper);
        delete this.eventsWrapper[event];
      }

      super.removeListener(event, callback);
    }

    return this;
  }

  /**
   * Unregisters all listeners either from an event, or from all events
   *
   * @param {string} [event]
   */
  removeAllListeners(event) {
    if (event !== undefined) {
      if (this.eventsWrapper[event] !== undefined) {
        for (const listener of this.eventsWrapper[event].listeners) {
          this.removeListener(event, listener);
        }
      }
    } else {
      for (const _event of Object.keys(this.eventsWrapper)) {
        this.removeAllListeners(_event);
      }
    }

    return this;
  }

  /**
   * Sends a payload to the connected server
   *
   * @param {Object} payload
   */
  send(payload) {
    this.socket.emit('kuzzle', payload);
  }

  /**
   * Closes the connection
   */
  close() {
    this.forceDisconnect = true;
    this.state = 'offline';
    this.socket.close();
    this.socket = null;
    this.disconnect();
  }

  _addEventWrapper(event, callback, once = false) {
    if (!this.eventsWrapper[event]) {
      const wrapper = (...args) => this.emit(event, ...args);

      this.eventsWrapper[event] = {
        wrapper,
        listeners: new Set()
      };

      if (['connect', 'connect_error', 'disconnect'].indexOf(event) === -1) {
        if (once) {
          this.socket.once(event, wrapper);
        } else {
          this.socket.on(event, wrapper);
        }
      }
    }

    this.eventsWrapper[event].listeners.add(callback);
  }
}

module.exports = SocketIO;
