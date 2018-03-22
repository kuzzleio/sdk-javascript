'use strict';

const
  AbstractWrapper = require('./common');

let
  _autoReconnect,
  _reconnectionDelay;

class RTWrapper extends AbstractWrapper {

  constructor (host, options) {
    super(host, options);

    _autoReconnect = options && typeof options.autoReconnect === 'boolean' ? options.autoReconnect : true;
    _reconnectionDelay = options && typeof options.reconnectionDelay === 'number' ? options.reconnectionDelay : 1000;

    if (options && options.offlineMode === 'auto' && this.autoReconnect) {
      this.autoQueue = this.autoReplay = true;
    }

    this.wasConnected = false;
    this.stopRetryingToConnect = false;
    this.retrying = false;
  }

  get autoReconnect () {
    return _autoReconnect;
  }

  get reconnectionDelay () {
    return _reconnectionDelay;
  }

  connect() {
    this.state = 'connecting';
    if (this.autoQueue) {
      this.startQueuing();
    }
  }

  /**
   * Called when the client's connection is established
   */
  clientConnected() {
    super.clientConnected('connected', this.wasConnected);

    this.state = 'connected';
    this.wasConnected = true;
    this.stopRetryingToConnect = false;
  }

  /**
   * Called when the client's connection is closed
   */
  clientDisconnected() {
    this.emit('disconnect');
  }

  /**
   * Called when the client's connection is closed with an error state
   *
   * @param {Error} error
   */
  clientNetworkError(error) {
    this.state = 'offline';
    if (this.autoQueue) {
      this.startQueuing();
    }

    this.emit('networkError', error);
    if (this.autoReconnect && !this.retrying && !this.stopRetryingToConnect) {
      this.retrying = true;
      setTimeout(() => {
        this.retrying = false;
        this.connect(this.host);
      }, this.reconnectionDelay);
    } else {
      this.emit('disconnect');
    }
  }

  isReady() {
    return this.state === 'connected';
  }
}

// make public properties enumerable
for (const prop of [
  'autoReconnect',
  'reconnectionDelay'
]) {
  Object.defineProperty(RTWrapper.prototype, prop, {enumerable: true});
}

module.exports = RTWrapper;
