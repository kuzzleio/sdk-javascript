'use strict';

const
  uuidv4 = require('../../uuidv4'),
  KuzzleEventEmitter = require('../../eventEmitter');

// read-only properties
let
  _host,
  _port,
  _ssl;

class AbstractWrapper extends KuzzleEventEmitter {

  constructor (options = {}) {
    super();

    _host = options.host;
    _port = typeof options.port === 'number' ? options.port : 7512;
    _ssl = typeof options.sslConnection === 'boolean' ? options.sslConnection : false;

    this.id = uuidv4();
    this.state = 'offline';

    Object.keys(options).forEach(opt => {
      if (this.hasOwnProperty(opt) && Object.getOwnPropertyDescriptor(this, opt).writable) {
        this[opt] = options[opt];
      }
    });
  }

  get host () {
    return _host;
  }

  get port () {
    return _port;
  }

  get ssl () {
    return _ssl;
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
    this.state = state || 'ready';
    this.emit(wasConnected && 'reconnect' || 'connect');
  }

  /**
   * Called when the client's connection is closed
   */
  close () {
    this.state = 'offline';
  }

  query (request) {
    if (!this.isReady()) {
      this.emit('discarded', request);
      return Promise.reject(new Error(`Unable to execute request: not connected to a Kuzzle server.
Discarded request: ${JSON.stringify(request)}`));
    }

    return new Promise((resolve, reject) => {
      this.once(request.requestId, response => {
        if (response.error) {
          const error = new Error(response.error.message);
          Object.assign(error, response.error);
          error.status = response.status;
          response.error = error;
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

}

module.exports = AbstractWrapper;
