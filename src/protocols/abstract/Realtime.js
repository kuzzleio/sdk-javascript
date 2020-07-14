'use strict';

const { KuzzleAbstractProtocol } = require('./Base');

class BaseProtocolRealtime extends KuzzleAbstractProtocol {
  constructor (host, options = {}) {
    super(host, options);

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
    this.clear();
    this.emit('disconnect');
  }

  /**
   * Called when the client's connection is closed with an error state
   *
   * @param {Error} error
   */
  clientNetworkError (error) {
    this.state = 'offline';
    this.clear();

    const connectionError = new Error(`Unable to connect to kuzzle server at ${this.host}:${this.port}`);
    connectionError.internal = error;

    this.emit('networkError', connectionError);

    if (this.autoReconnect && !this.retrying && !this.stopRetryingToConnect) {
      this.retrying = true;

      if ( typeof window === 'object'
        && typeof window.navigator === 'object'
        && window.navigator.onLine === false
      ) {
        window.addEventListener(
          'online',
          () => {
            this.retrying = false;
            this.connect().catch(err => this.clientNetworkError(err));
          },
          { once: true });
        return;
      }

      setTimeout(() => {
        this.retrying = false;
        this.connect().catch(err => this.clientNetworkError(err));
      }, this.reconnectionDelay);
    }
    else {
      this.emit('disconnect');
    }
  }

  isReady () {
    return this.state === 'connected';
  }
}

module.exports = BaseProtocolRealtime;
