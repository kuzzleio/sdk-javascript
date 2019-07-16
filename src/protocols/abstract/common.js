'use strict';

const
  KuzzleError = require('../../KuzzleError'),
  uuidv4 = require('../../uuidv4'),
  KuzzleEventEmitter = require('../../eventEmitter');

class AbstractWrapper extends KuzzleEventEmitter {

  constructor (host, options = {}) {
    super();

    this._pendingRequests = new Map();
    this._host = host;
    this._port = typeof options.port === 'number' ? options.port : 7512;
    this._ssl = typeof options.sslConnection === 'boolean' ? options.sslConnection : false;

    this.id = uuidv4();
    this.state = 'offline';

    Object.keys(options).forEach(opt => {
      if (this.hasOwnProperty(opt) && Object.getOwnPropertyDescriptor(this, opt).writable) {
        this[opt] = options[opt];
      }
    });
  }

  get host () {
    return this._host;
  }

  get port () {
    return this._port;
  }

  get ssl () {
    return this._ssl;
  }

  get connected () {
    return this.state === 'online';
  }

  get pendingRequests () {
    return this._pendingRequests;
  }

  /**
   * @abstract
   * @returns {Promise<any>}
   */
  connect () {
    throw new Error('Method "connect" is not implemented');
  }

  /**
   * @abstract
   * @param request
   * @returns {Promise<any>}
   */
  send () {
    throw new Error('Method "send" is not implemented');
  }

  /**
   * Called when the client's connection is established
   */
  clientConnected (state, wasConnected) {
    this.on('disconnected', () => this.clear());

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

  query (request) {
    if (!this.isReady()) {
      this.emit('discarded', request);
      return Promise.reject(new Error(`Unable to execute request: not connected to a Kuzzle server.
Discarded request: ${JSON.stringify(request)}`));
    }

    this._pendingRequests.set(request.requestId, request);

    return new Promise((resolve, reject) => {
      this.once(request.requestId, response => {
        this._pendingRequests.delete(request.requestId);

        if (response.error) {
          const error = new KuzzleError(response.error);

          this.emit('queryError', error, request);

          if (request.action !== 'logout' && error.message === 'Token expired') {
            this.emit('tokenExpired');
          }

          return reject(error);
        }

        return resolve(response);
      });

      this.send(request);
    });
  }

  isReady () {
    return this.state === 'ready';
  }

  /**
   * Clear pendings requests.
   * Emits an event for each discarded pending request.
   */
  clear () {
    for (const request of this._pendingRequests.values()) {
      this.emit('discarded', request);
    }

    this._pendingRequests.clear();
  }

}

module.exports = AbstractWrapper;
