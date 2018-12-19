'use strict';

const
  KuzzleAbstractProtocol = require('./common');

class RTWrapper extends KuzzleAbstractProtocol {

  constructor (options = {}) {
    super(options);

    this._autoReconnect = typeof options.autoReconnect === 'boolean' ? options.autoReconnect : true;
    this._reconnectionDelay = typeof options.reconnectionDelay === 'number' ? options.reconnectionDelay : 1000;

    this.wasConnected = false;
    this.stopRetryingToConnect = false;
    this.retrying = false;
  }

  get autoReconnect () {
    return this._autoReconnect;
  }

  get reconnectionDelay () {
    return this._reconnectionDelay;
  }

  connect() {
    this.state = 'connecting';
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

    const connectionError = new Error(`Unable to connect to kuzzle server at ${this.host}:${this.port}`);
    connectionError.internal = error;

    this.emit('networkError', connectionError);
    if (this.autoReconnect && !this.retrying && !this.stopRetryingToConnect) {
      this.retrying = true;

      setTimeout(() => {
        this.retrying = false;
        this.connect(this.host).catch(err => this.clientNetworkError(err));
      }, this.reconnectionDelay);
    } else {
      this.emit('disconnect');
    }
  }

  isReady() {
    return this.state === 'connected';
  }
}

module.exports = RTWrapper;
