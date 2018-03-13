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
      http: {
        value: {
          // Global default HTTP route overrides (use these routes instead of ones provided by Kuzzle serverInfo):
          routes: {
            auth: {
              login: {
                verb: 'POST',
                url: '/_login/:strategy'
              }
            },
            bulk: {
              import: {
                verb: 'POST',
                url: '/:index/:collection/_bulk'
              }
            },
            document: {
              create: {
                verb: 'POST',
                url: '/:index/:collection/_create'
              }
            },
            security: {
              createFirstAdmin: {
                verb: 'POST',
                url: '/_createFirstAdmin'
              },
              createRestrictedUser: {
                verb: 'POST',
                url: '/users/_createRestricted'
              },
              createUser: {
                verb: 'POST',
                url: '/users/_create'
              }
            }
          }
        },
        writable: false,
        enumerable: false
      }
    });

    // Application-side HTTP route overrides:
    if (options.http && options.http.customRoutes) {
      for (const controller in options.http.customRoutes) {
        if (options.http.customRoutes.hasOwnProperty(controller)) {
          this.http.routes[controller] = Object.assign(this.http.routes[controller] || {}, options.http.customRoutes[controller]);
        }
      }
    }
  }

  /**
   * Connect to the websocket server
   */
  connect () {
    if (this.autoQueue) {
      this.startQueuing();
    }

    sendHttpRequest(this, 'GET', '/', (err, res) => {
      if (err) {
        return this.emit('networkError', err);
      }

      // Get HTTP Routes from Kuzzle serverInfo
      // (if more than 1 available route for a given action, get the first one):
      const routes = res.result.serverInfo.kuzzle.api.routes;
      for (const controller in routes) {
        if (routes.hasOwnProperty(controller)) {
          if (this.http.routes[controller] === undefined) {
            this.http.routes[controller] = {};
          }

          for (const action in routes[controller]) {
            if (this.http.routes[controller][action] === undefined
              && Array.isArray(routes[controller][action].http)
              && routes[controller][action].http.length > 0) {

              this.http.routes[controller][action] = routes[controller][action].http[0];
            }
          }
        }
      }

      // Client is ready
      this.clientConnected();
    });
  }

  /**
   * Sends a payload to the connected server
   *
   * @param {Object} payload
   */
  send (data) {
    const
      payload = {
        action: undefined,
        body: undefined,
        collection: undefined,
        controller: undefined,
        headers: {
          'Content-Type': 'application/json'
        },
        index: undefined,
        meta: undefined,
        requestId: undefined,
      },
      queryArgs = {};

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];

        if (key === 'body') {
          payload.body = JSON.stringify(value);

        } else if (key === 'jwt') {
          payload.headers.authorization = 'Bearer ' + value;

        } else if (key === 'volatile') {
          payload.headers['x-kuzzle-volatile'] = JSON.stringify(value);

        } else if (payload.hasOwnProperty(key)) {
          payload[key] = value;

        } else {
          queryArgs[key] = value;
        }
      }
    }

    payload.headers['Content-Length'] = Buffer.byteLength(payload.body || '');

    const
      route = this.http.routes[payload.controller] && this.http.routes[payload.controller][payload.action];

    if (route === undefined) {
      const error = new Error(`No route found for ${payload.controller}/${payload.action}`);
      return this.emit(payload.requestId, {status: 400, error});
    }

    const
      method = route.verb,
      regex = /\/\:([^\/]*)/; //eslint-disable-line

    let
      url = route.url,
      matches = regex.exec(url);

    while (matches) {
      url = url.replace(regex, '/' + data[ matches[1] ]);
      delete(queryArgs[ matches[1] ]);
      matches = regex.exec(url);
    }

    // inject queryString arguments:
    const queryString = [];
    for (const key in queryArgs) {
      if (queryArgs.hasOwnProperty(key)) {
        const value = queryArgs[key];

        if (Array.isArray(value)) {
          queryString.push(...value.map(v => `${key}=${v}`));

        } else {
          queryString.push(`${key}=${value}`);
        }
      }
    }

    if (queryString.length > 0) {
      url += '?' + queryString.join('&');
    }

    sendHttpRequest(this, method, url, payload, (error, response) => {
      if (error && response) {
        response.error = error;
      }
      this.emit(payload.requestId, response || {error});
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
function sendHttpRequest (network, method, path, payload, cb) {
  if (!cb && typeof payload === 'function') {
    cb = payload;
    payload = {};
  }

  if (typeof XMLHttpRequest === 'undefined') { // NodeJS implementation, using http.request:
    const
      http = network.ssl && require('https') || require('http'),
      body = payload.body || '',
      options = {
        protocol: network.protocol,
        host: network.host,
        port: network.port,
        method,
        path,
        headers: payload.headers
      };

    const req = http.request(options, res => {
      let response = '';

      res.on('data', chunk => {
        response += chunk;
      });

      res.on('end', () => callbackHttpResponse(response, cb));
    });

    req.write(body);

    req.on('error', err => {
      cb(err);
    });

    req.end();

  } else { // Browser implementation, using XMLHttpRequest:
    const
      xhr = new XMLHttpRequest(),
      url = network.protocol + '//' + network.host + ':' + network.port + path;

    xhr.open(method, url);

    for (const header in payload.headers) {
      if (payload.headers.hasOwnProperty(header)) {
        xhr.setRequestHeader(header, payload.headers[header]);
      }
    }

    xhr.onload = () => callbackHttpResponse(xhr.responseText, cb);

    xhr.send(payload.body);
  }
}

/**
 * Handles HTTP Response
 *
 */
function callbackHttpResponse(response, cb) {
  try {
    const jsonResponse = JSON.parse(response);
    cb(null, jsonResponse);
  } catch (err) {
    cb(err);
  }
}

module.exports = HttpWrapper;
