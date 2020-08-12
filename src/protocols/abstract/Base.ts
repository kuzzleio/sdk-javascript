'use strict';

import { KuzzleError } from '../../KuzzleError';
import { uuidv4 } from '../../utils/uuidv4';
import { KuzzleEventEmitter } from '../../core/KuzzleEventEmitter';
import { PendingRequest } from './PendingRequest';
import { KuzzleRequest, JSONObject } from '../../utils/interfaces';

/**
 * @todo proper TS conversion
 */
export abstract class KuzzleAbstractProtocol extends KuzzleEventEmitter {
  private _pendingRequests: Map<string, PendingRequest>;
  private _host: string;
  private _name: string;
  private _port: number;
  private _ssl: boolean;

  public id: string;

  public state: string;

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

    Object.keys(options).forEach(opt => {
      if ( Object.prototype.hasOwnProperty.call(this, opt)
        && Object.getOwnPropertyDescriptor(this, opt).writable
      ) {
        this[opt] = options[opt];
      }
    });

    this._stacks = new Map();
  }

  get host () {
    return this._host;
  }

  get name () {
    return this._name;
  }

  get port () {
    return this._port;
  }

  get ssl () {
    return this._ssl;
  }

  get connected () {
    return this.state === 'connected';
  }

  get pendingRequests () {
    return this._pendingRequests;
  }

  abstract connect (): Promise<any>

  abstract send (request: KuzzleRequest, options: JSONObject): void

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

  query (request, options) {
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
        const error = new KuzzleError(response.error, stack);

        this.emit('queryError', error, request);

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
