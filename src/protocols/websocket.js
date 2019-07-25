'use strict';

const
  KuzzleError = require('../KuzzleError'),
  RTWrapper = require('./abstract/realtime');

class WSNode extends RTWrapper {

  constructor(host, options = {}) {
    super(host, options);

    if (typeof host !== 'string' || host === '') {
      throw new Error('host is required');
    }

    // Browsers WebSocket API
    if (typeof WebSocket !== 'undefined') {
      this.WebSocketClient = WebSocket;
      // There are no options allowed in the browsers WebSocket API
      this.options = null;
    } else {
      this.WebSocketClient = require('ws');
      this.options = {
        perMessageDeflate: false,
        headers: options.headers || null
      };

      if (this.options.headers !== null &&
          (Array.isArray(this.options.headers) ||
          typeof this.options.headers !== 'object')) {
        throw new Error('Invalid "headers" option: expected an object');
      }
    }

    this.client = null;
    this.lasturl = null;
  }

  /**
   * Connect to the websocket server
   */
  connect () {
    return new Promise((resolve, reject) => {
      const url = `${this.ssl ? 'wss' : 'ws'}://${this.host}:${this.port}`;

      super.connect();

      if (url !== this.lasturl) {
        this.wasConnected = false;
        this.lasturl = url;
      }

      this.client = new this.WebSocketClient(url, this.options);

      this.client.onopen = () => {
        this.clientConnected();
        return resolve();
      };

      this.client.onclose = (closeEvent, message) => {
        let
          status,
          reason = message;

        if (typeof closeEvent === 'number') {
          status = closeEvent;
        }
        else {
          status = closeEvent.code;

          if (closeEvent.reason) {
            reason = closeEvent.reason;
          }
        }

        if (status === 1000) {
          this.clientDisconnected();
        }
        // do not forward a connection close error if no
        // connection has been previously established
        else if (this.wasConnected) {
          const error = new Error(reason);
          error.status = status;

          this.clientNetworkError(error);
        }
      };

      this.client.onerror = error => {
        let err = error;

        if (!(error instanceof Error)) {
          err = error ?
            new Error(error.message || error) : new Error('Unexpected error');
        }

        this.clientNetworkError(err);

        if ([this.client.CLOSING, this.client.CLOSED].indexOf(this.client.readyState) > -1) {
          return reject(err);
        }
      };

      this.client.onmessage = payload => {
        const data = JSON.parse(payload.data || payload);

        // for responses, data.room == requestId
        if (data.room) {
          this.emit(data.room, data);
        }
        else {
          // @deprecated
          this.emit('discarded', data);

          const error = new KuzzleError(data.error);
          this.emit('queryError', error, data);
        }
      };

    });
  }

  /**
   * Sends a payload to the connected server
   *
   * @param {Object} payload
   */
  send (payload) {
    if (this.client && this.client.readyState === this.client.OPEN) {
      this.client.send(JSON.stringify(payload));
    }
  }

  /**
   * Closes the connection
   */
  close () {
    this.state = 'offline';
    this.removeAllListeners();
    this.wasConnected = false;
    if (this.client) {
      this.client.close();
    }
    this.client = null;
    this.stopRetryingToConnect = true;
    super.close();
  }
}

module.exports = WSNode;
