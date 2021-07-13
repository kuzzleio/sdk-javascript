'use strict';

import { KuzzleError } from '../KuzzleError';
import { BaseProtocolRealtime } from './abstract/Realtime';
import { JSONObject } from '../types';
import { RequestPayload } from '../types/RequestPayload';
import HttpProtocol from './Http';
import * as DisconnectionOrigin from './DisconnectionOrigin';

/**
 * WebSocket protocol used to connect to a Kuzzle server.
 */
export default class WebSocketProtocol extends BaseProtocolRealtime {
  private WebSocketClient: any;
  private options: any;
  private client: any;
  private lasturl: any;
  private ping: any;
  private pongTimeoutId: ReturnType<typeof setTimeout>;
  private pingIntervalId: ReturnType<typeof setInterval>;
  private _pingInterval: number;
  private _pongTimeout: number;
  private _httpProtocol: HttpProtocol;

  /**
   * @param host Kuzzle server hostname or IP
   * @param options WebSocket connection options
   *    - `autoReconnect` Automatically reconnect to kuzzle after a `disconnected` event. (default: `true`)
   *    - `port` Kuzzle server port (default: `7512`)
   *    - `headers` Connection custom HTTP headers (Not supported by browsers)
   *    - `reconnectionDelay` Number of milliseconds between reconnection attempts (default: `1000`)
   *    - `pingInterval` Number of milliseconds between two pings (default: `10000`)
   *    - `ssl` Use SSL to connect to Kuzzle server. Default `false` unless port is 443 or 7443.
   */
  constructor(
    host: string,
    options: {
      autoReconnect?: boolean;
      port?: number;
      headers?: JSONObject;
      reconnectionDelay?: number;
      pingInterval?: number;
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

    this._pingInterval = typeof options.pingInterval === 'number' ? options.pingInterval : 2000;
    this._pongTimeout = this._pingInterval;
    this.client = null;
    this.lasturl = null;
  }

  /**
   * Connect to the websocket server
   */
  _connect (): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `${this.ssl ? 'wss' : 'ws'}://${this.host}:${this.port}`;

      super.connect();

      if (url !== this.lasturl) {
        this.wasConnected = false;
        this.lasturl = url;
      }

      this.client = new this.WebSocketClient(url, this.options);
      /**
       * Defining behavior depending on the Websocket client type
       * Which can be the browser or node one.
       */
      if (typeof WebSocket !== 'undefined') {
        this.ping = () => {
          this.client.send('{"p":1}');
        };
      }
      else {
        this.ping = () => {
          this.client.ping();
        };
        this.client.on('pong', () => {
          clearTimeout(this.pongTimeoutId);
        });
      }
      this.client.onopen = () => {
        this.clientConnected();
        /**
        * Send pings to the server
        */
        this.pingIntervalId = setInterval(() => {
          if (this.client && this.client.readyState === 1) {
            this.ping();
          }
          this.pongTimeoutId = setTimeout(() => {
            const error: any = new Error('Connection lost.');
            error.status = 503;
            this.clientNetworkError(error);
          }, this._pongTimeout);
        }, this._pingInterval);
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
          this.clientDisconnected(DisconnectionOrigin.USER_CONNECTION_CLOSED);
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

        /**
         * Since Kuzzle 2.10.0
         * Corresponds to a custom pong response message
         */
        if (data && data.p && data.p === 2 && Object.keys(data).length === 1) {
          clearTimeout(this.pongTimeoutId);
          return;
        }

        // for responses, data.room == requestId
        if (data.room) {
          this.emit(data.room, data);
        }
        else {
          // @deprecated
          this.emit('discarded', data);

          const error = new KuzzleError(
            data.error,
            (new Error().stack),
            this.constructor.name);

          this.emit('queryError', { error, request: data });
        }
        /**
         * In case you're running a Kuzzle version under 2.10.0
         * The response from a browser custom ping will be another payload.
         * We need to clear this timeout at each message to keep
         * the connection alive if it's the case
         */
        clearTimeout(this.pongTimeoutId);
      };
    });
  }

  connect (): Promise<void> {
    if (this.cookieSupport) {
      return this._httpProtocol.connect()
        .then(() => this._connect());
    }
    return this._connect();
  }

  enableCookieSupport () {
    if (typeof XMLHttpRequest === 'undefined') {
      throw new Error('Support for cookie cannot be enabled outside of a browser');
    }

    super.enableCookieSupport();
    this._httpProtocol = new HttpProtocol(
      this.host,
      {
        port: this.port,
        ssl: this.ssl,
      }
    );
    this._httpProtocol.enableCookieSupport();
  }

  /**
   * Sends a payload to the connected server
   *
   * @param {Object} payload
   */
  send (request: RequestPayload, options: JSONObject = {}) {
    if (!this.client || this.client.readyState !== this.client.OPEN) {
      return;
    }

    if (! this.cookieSupport
      || request.controller !== 'auth'
      || ( request.action !== 'login'
        && request.action !== 'logout'
        && request.action !== 'refreshToken')
    ) {
      this.client.send(JSON.stringify(request));
      return;
    }

    const formattedRequest = this._httpProtocol.formatRequest(request, options);

    if (!formattedRequest) {
      return;
    }

    this.emit('websocketRenewalStart'); // Notify that the websocket is going to renew his connection with Kuzzle
    if (this.client) {
      this.client.close();
    }
    this.client = null;
    this.clientDisconnected(DisconnectionOrigin.WEBSOCKET_AUTH_RENEWAL); // Simulate a disconnection, this will enable offline queue and trigger realtime subscriptions backup

    this._httpProtocol._sendHttpRequest(formattedRequest)
      .then(response => {
        // Reconnection
        return this.connect()
          .then(() => {
            this.emit(formattedRequest.payload.requestId, response);
            this.emit('websocketRenewalDone'); // Notify that the websocket has finished renewing his connection with Kuzzle
          });
      })
      .catch(error => this.emit(formattedRequest.payload.requestId, {error}));

  }

  /**
   * @override
   */
  clientDisconnected(origin: string) {
    clearInterval(this.pingIntervalId);
    clearTimeout(this.pongTimeoutId);
    super.clientDisconnected(origin);
  }

  /**
   * @override
   *
   * @param {Error} error
   */
  clientNetworkError (error) {
    clearInterval(this.pingIntervalId);
    clearTimeout(this.pongTimeoutId);
    super.clientNetworkError(error);
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
