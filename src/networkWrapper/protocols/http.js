'use strict';

const
  AbtractWrapper = require('./abstract/common');

class HttpWrapper extends AbtractWrapper {

  constructor(host, options) {
    super(host, options);
    Object.defineProperties(this, {
      protocol: {
        value: (this.ssl ? 'https:' : 'http:'),
        writeable: false,
        enumerable: false
      },
      httpRoutes: {
        value: {},
        writable: true,
        enumerable: false
      }
    });
  }

  /**
   * Connect to the websocket server
   */
  connect () {
    sendHttpRequest(this, 'GET', '/', (err, res) => {
      if (err) {
        return this.emitEvent('networkError', err);
      }

      this.httpRoutes = res.result.serverInfo.kuzzle.api.routes;
      this.clientConnected();
    });
  }

  /**
   * Sends a payload to the connected server
   *
   * @param {Object} payload
   */
  send (payload) {
    const route = this.httpRoutes[payload.controller][payload.action];

    if (route === undefined) {
      return this.emit(payload.requestId, `No route found for ${payload.controller}/${payload.action}`);
    }

    const
      method = route.http.verb,
      regex = /\/\:([^\/]*)/; //eslint-disable-line

    let
      url = route.http.url,
      matches = regex.exec(url);

    while (matches) {
      url = url.replace(regex, '/' + payload[ matches[1] ]);
      matches = regex.exec(url);
    }

    sendHttpRequest(this, method, url, payload.body, (error, response) => {
      if (error && response) {
        response.error = error;
      }
      this.emitEvent(payload.requestId, response || {error});
    });
  }

  /**
   * Closes the connection
   */
  close () {
    this.disconnect();
  }

}

/**
 * Handles HTTP Request
 *
 */
function sendHttpRequest (network, method, path, body, cb) {
  if (!cb && typeof body === 'function') {
    cb = body;
    body = null;
  }

  if (typeof XMLHttpRequest === 'undefined') { // NodeJS implementation, using http.request:
    const
      http = network.ssl && require('https') || require('http'),
      reqBody = body && JSON.stringify(body) || '',
      options = {
        protocol: network.protocol,
        host: network.host,
        port: network.port,
        method,
        path,
        headers: {
          'Content-Length': Buffer.byteLength(reqBody),
          'Content-Type': 'application/json'
        }
      },
      req = http.request(options, res => {
        let response = '';

        res.on('data', chunk => {
          response += chunk;
        });

        res.on('end', () => {
          cb(null, JSON.parse(response));
        });
      });

    req.write(reqBody);

    req.on('error', err => {
      cb(err);
    });

    req.end();

  } else { // Browser implementation, using XMLHttpRequest:
    const
      xhr = new XMLHttpRequest(),
      url = network.protocol + '//' + network.host + ':' + network.port + path;

    xhr.open(method, url);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = () => {
      const response = JSON.parse(xhr.responseText);
      cb(null, response);
    };

    xhr.send(body && JSON.stringify(body));
  }
}


module.exports = HttpWrapper;
