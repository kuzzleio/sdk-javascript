'use strict';

import { KuzzleError } from '../../KuzzleError';
import { uuidv4 } from '../../utils/uuidv4';
import { KuzzleEventEmitter } from '../../core/KuzzleEventEmitter';
import { PendingRequest } from './PendingRequest';
import { JSONObject } from '../../types';
import { RequestPayload } from '../../types/RequestPayload';

export abstract class KuzzleAbstractProtocol extends KuzzleEventEmitter {
  private _pendingRequests: Map<string, PendingRequest>;
  private _host: string;
  private _name: string;
  private _port: number;
  private _ssl: boolean;
  private _cookieSupport: boolean;

  public id: string;

  public state: string;

  get sslConnection (): boolean {
    return this._ssl;
  }

  constructor (host: string, options: JSONObject = {}, name: string = undefined) {
    super();

    this._pendingRequests = new Map();
    this._host = host;
    this._name = name;
    const port = parseInt(options.port, 10);
    this._port = isNaN(port) ? 7512 : port;

    if (options.ssl !== undefined && options.sslConnection !== undefined) {
      throw new Error('Both "ssl" and "sslConnection" options are set. Use only "ssl".');
    }

    if (typeof options.ssl === 'boolean') {
      this._ssl = options.ssl;
    }
    else if (typeof options.sslConnection === 'boolean') {
      this._ssl = options.sslConnection;
    }
    else if (port === 443 || port === 7443) {
      this._ssl = true;
    }
    else {
      this._ssl = false;
    }

    this.id = uuidv4();
    this.state = 'offline';
    this._cookieSupport = false;

    Object.keys(options).forEach(opt => {
      if ( Object.prototype.hasOwnProperty.call(this, opt)
        && Object.getOwnPropertyDescriptor(this, opt).writable
      ) {
        this[opt] = options[opt];
      }
    });
  }

  /**
   * Kuzzle server host or IP.
   */
  get host () {
    return this._host;
  }

  /**
   * Protocol name.
   */
  get name () {
    return this._name;
  }

  /**
   * Kuzzle server port.
   */
  get port () {
    return this._port;
  }

  /**
   * `true` if ssl is active.
   */
  get ssl () {
    return this._ssl;
  }

  /**
   * `true` if the socket is open.
   */
  get connected () {
    return this.state === 'connected';
  }

  /**
   * `true` if cookie authentication is enabled
   */
  get cookieSupport () {
    return this._cookieSupport;
  }

  get pendingRequests () {
    return this._pendingRequests;
  }

  abstract connect (): Promise<any>

  abstract send (request: RequestPayload, options: JSONObject): void


  /**
   * Called when we want to enable http cookie support
   */
  enableCookieSupport () {
    this._cookieSupport = true;
  }

  /**
   * Called when the client's connection is established
   */
  clientConnected (state?: string, wasConnected?: boolean) {
    this.state = state || 'ready';
    this.emit(wasConnected && 'reconnect' || 'connect');
  }

  /**
   * Called when the client's connection is closed
   */
  close () {
    this.state = 'offline';
    this.clear();
  }

  query (request: RequestPayload, options) {
    if (!this.isReady()) {
      this.emit('discarded', request);
      return Promise.reject(new Error(`Unable to execute request: not connected to a Kuzzle server.
Discarded request: ${JSON.stringify(request)}`));
    }

    const stack = Error().stack;

    const pending = new PendingRequest(request);
    this._pendingRequests.set(request.requestId, pending);

    this.once(request.requestId, response => {
      this._pendingRequests.delete(request.requestId);

      if (response.error) {
        let error: KuzzleError;

        // Wrap API error but directly throw errors that comes from SDK
        if (response.error.status) {
          error = new KuzzleError(response.error, stack, this.constructor.name, request);
        }
        else {
          // Keep both stacktrace because the one we captured in "stack" will give
          // more information (async stacktrace are not very talkative)
          const lines = stack.split('\n');
          lines[0] = '';
          response.error.stack += '\n' + lines.join('\n');
          error = response.error;
        }

        this.emit('queryError', { error, request });

        if (request.action !== 'logout' && error.id === 'security.token.invalid') {
          this.emit('tokenExpired');
        }

        return pending.reject(error);
      }

      pending.resolve(response);
    });

    this.send(request, options);

    return pending.promise;
  }

  isReady () {
    return this.state === 'ready';
  }

  /**
   * Clear pendings requests.
   * Emits an event for each discarded pending request.
   */
  clear () {
    const rejectedError = new Error('Network error: request was sent but no response has been received');
    for (const pending of this._pendingRequests.values()) {
      pending.reject(rejectedError);
      this.removeAllListeners(pending.request.requestId);
      this.emit('discarded', pending.request);
    }

    this._pendingRequests.clear();
  }
}
