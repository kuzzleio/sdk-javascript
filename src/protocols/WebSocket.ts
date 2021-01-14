'use strict';

import { KuzzleError } from '../KuzzleError';
import { BaseProtocolRealtime } from './abstract/Realtime';
import { JSONObject } from '../types';
import { RequestPayload } from '../types/RequestPayload';

/**
 * WebSocket protocol used to connect to a Kuzzle server.
 */
export default class WebSocketProtocol extends BaseProtocolRealtime {
  private WebSocketClient: any;
  private options: any;
  private client: any;
  private lasturl: any;

  /**
   * @param host Kuzzle server hostname or IP
   * @param options WebSocket connection options
   *    - `autoReconnect` Automatically reconnect to kuzzle after a `disconnected` event. (default: `true`)
   *    - `port` Kuzzle server port (default: `7512`)
   *    - `headers` Connection custom HTTP headers (Not supported by browsers)
   *    - `reconnectionDelay` Number of milliseconds between reconnection attempts (default: `1000`)
   *    - `ssl` Use SSL to connect to Kuzzle server. Default `false` unless port is 443 or 7443.
   */
  constructor(
    host: string,
    options: {
      autoReconnect?: boolean;
      port?: number;
      headers?: JSONObject;
      reconnectionDelay?: number;
      /**
       * @deprecated Use `ssl` instead
       */
      sslConnection?: boolean;
      ssl?: boolean;
    } = {}
  ) {
    super(host, options, 'ws');

    if (typeof host !== 'string' || host === '') {
      throw new Error('host is required');
    }

    // Browsers WebSocket API
    if (typeof WebSocket !== 'undefined') {
      this.WebSocketClient = WebSocket;
      // There are no options allowed in the browsers WebSocket API
      this.options = null;
    }
    else {
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
  connect (): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `${this.ssl ? 'wss' : 'ws'}://${this.host}:${this.port}`;

      super.connect();

      if (url !== this.lasturl) {
        this.wasConnected = false;
        this.lasturl = url;
      }

      this.client = new this.WebSocketClient(url, this.options);

      this.client.onping = () => {
        this.heartbeat(this.client);
      }

      this.client.onpong = () => {
        this.isAlive = true;
      }

      this.client.onopen = () => {
        this.clientConnected();
        this.heartbeat(this.client);
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
          const error: any = new Error(reason);
          error.status = status;

          this.clientNetworkError(error);
        }
      };

      this.client.onerror = error => {
        let err = error;

        if (!(error instanceof Error)) {
          // browser-side, the payload sent to this event is a generic "Event"
          // object bearing no information about the cause of the error
          err = error && (typeof Event === 'undefined' || !(error instanceof Event)) ?
            new Error(error.message || error) : new Error('Connection error');
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
      clearTimeout(this.pingTimeout);
      this.isAlive = false;
    });
  }

  /**
   * Sends a payload to the connected server
   *
   * @param {Object} payload
   */
  send (request: RequestPayload) {
    if (this.client && this.client.readyState === this.client.OPEN) {
      this.client.send(JSON.stringify(request));
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
