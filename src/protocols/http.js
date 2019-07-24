'use strict';

const
  staticHttpRoutes = require('./routes.json'),
  KuzzleAbstractProtocol = require('./abstract/common');

class HttpWrapper extends KuzzleAbstractProtocol {
  constructor(host, options = {}) {
    super(host, options);

    if (typeof host !== 'string' || host === '') {
      throw new Error('host is required');
    }

    this._routes = {};

    this.customRoutes = options.customRoutes || {};

    for (const [controller, definition] of Object.entries(this.customRoutes)) {
      for (const [action, route] of definition) {
        if (!(typeof route.url === 'string' && route.url.length > 0)) {
          throw new Error(
            `Incorrect URL for custom route ${controller}:${action}.`);
        }
        if (!(typeof route.verb === 'string' && route.verb.length > 0)) {
          throw new Error(
            `Incorrect VERB for custom route ${controller}:${action}.`);
        }
      }
    }
  }

  // @deprecated
  get http () {
    return this.routes;
  }

  get routes () {
    return this._routes;
  }

  get protocol () {
    return this.ssl ? 'https' : 'http';
  }

  get connected () {
    return true;
  }

  /**
   * Connect to the websocket server
   */
  connect () {
    if (this.state === 'ready') {
      return Promise.resolve();
    }

    return this._sendHttpRequest('GET', '/_publicApi')
      .then(({ result }) => {
        this._routes = this._constructRoutes(result);
      })
      .catch(error => {
        if (error.status === 401 || error.status === 403) {
          this._warn('"server:publicApi" route is restricted for anonymous user.');
          this._warn('This route is used by the HTTP protocol to build API URLs.');
          this._warn('Fallback to static routes, some API routes may be unavailable as well as plugin custom routes');

          // fallback to static http routes
          this._routes = staticHttpRoutes;
          this._staticRoutes = true;

          return;
        } else if (error.status === 404) {
          // fallback to server:info route
          // server:publicApi is only available since Kuzzle 1.9.0
          return this._sendHttpRequest('GET', '/')
            .then(({ result }) => {
              this._routes = this._constructRoutes(result.serverInfo.kuzzle.api.routes);
            })
            .catch(err => {
              if (err.status !== 401 && err.status !== 403) {
                throw err;
              }

              this._warn('"server:info" route is restricted for anonymous user.');
              this._warn('This route is used by the HTTP protocol to build API URLs.');
              this._warn('If you want to expose your API routes without disclosing server information you can use "server:publicApi" (available in Kuzzle 1.9.0).');
              this._warn('Fallback to static routes, some API routes may be unavailable as well as plugin custom routes');

              // fallback to static http routes
              this._routes = staticHttpRoutes;
              this._staticRoutes = true;
            });
        }
        throw error;
      })
      .then(() => {
        // Client is ready
        this.clientConnected();
      })
      .catch(err => {
        const connectionError = new Error(`Unable to connect to kuzzle server at ${this.host}:${this.port}`);
        connectionError.internal = err;

        this.emit('networkError', connectionError);
        throw err;
      });
  }

  /**
   * Sends a payload to the connected server
   *
   * @param {Object} data
   * @returns {Promise<any>}
   */
  send (data) {
    if (data.controller.indexOf('/') !== -1) {
      throw new Error(`Cannot execute request to plugin controller ${data.controller}. You have to authorize anonymous user to access either "server:publicApi" or "server:info" route`);
    }

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

    for (const key of Object.keys(data)) {
      const value = data[key];

      if (key === 'body') {
        payload.body = JSON.stringify(value);
      }
      else if (key === 'jwt') {
        payload.headers.authorization = 'Bearer ' + value;
      }
      else if (key === 'volatile') {
        payload.headers['x-kuzzle-volatile'] = JSON.stringify(value);
      }
      else if (payload.hasOwnProperty(key)) {
        payload[key] = value;
      }
      else if (value !== undefined && value !== null) {
        queryArgs[key] = value;
      }
    }

    const
      route = this.http.routes[payload.controller] && this.http.routes[payload.controller][payload.action];

    if (route === undefined) {
      const error = new Error(`No route found for ${payload.controller}/${payload.action}`);
      this.emit(payload.requestId, {status: 400, error});
    }

    const
      method = route.verb,
      regex = /\/:([^/]*)/;

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
    for (const key of Object.keys(queryArgs)) {
      const value = queryArgs[key];

      if (Array.isArray(value)) {
        queryString.push(...value.map(v => `${key}=${v}`));

      }
      else {
        queryString.push(`${key}=${value}`);
      }
    }

    if (queryString.length > 0) {
      url += '?' + queryString.join('&');
    }

    this._sendHttpRequest(method, url, payload)
      .then(response => this.emit(payload.requestId, response))
      .catch(error => this.emit(payload.requestId, {error}));
  }

  _sendHttpRequest (method, path, payload = {}) {
    if (typeof XMLHttpRequest === 'undefined') {
      // NodeJS implementation, using http.request:

      const httpClient = require('min-req-promise');

      if (path[0] !== '/') {
        path = `/${path}`;
      }
      const url = `${this.protocol}://${this.host}:${this.port}${path}`;

      const headers = payload.headers || {};
      headers['Content-Length'] = Buffer.byteLength(payload.body || '');

      return httpClient.request(url, method, {
        headers,
        body: payload.body
      })
        .then(response => JSON.parse(response.body));
    }

    // Browser implementation, using XMLHttpRequest:
    return new Promise((resolve, reject) => {
      const
        xhr = new XMLHttpRequest(),
        url = `${this.protocol}://${this.host}:${this.port}${path}`;

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 0) {
          reject(new Error('Cannot connect to host. Is the host online?'));
        }
      };

      xhr.open(method, url);

      for (const header of Object.keys(payload.headers || {})) {
        xhr.setRequestHeader(header, payload.headers[header]);
      }

      xhr.onload = () => {
        try {
          const json = JSON.parse(xhr.responseText);
          resolve(json);
        }
        catch (err) {
          reject(err);
        }
      };

      xhr.send(payload.body);
    });
  }

  _constructRoutes (publicApi) {
    const apiRoutes = Object.entries(publicApi)
      .reduce((routes, [controller, definition]) => {
        routes[controller] = {};

        for (const [action, { http }] of Object.entries(definition)) {
          if (http && http.length === 1) {
            routes[controller][action] = http[0];
          } else if (http && http.length > 1) {
            routes[controller][action] = getCorrectRoute(http);
          }
        }

        return routes;
      }, {});

    for (const [controller, definition] of Object.entries(this.customRoutes)) {
      apiRoutes[controller] = definition;
    }

    return apiRoutes;
  }

  _warn (message) {
    console.warn(message); // eslint-disable-line no-console
  }

}

function getCorrectRoute (routes) {
  let
    shortestRoute = routes[0],
    postRoute,
    minLength = routes[0].url.length,
    sameLength = true;

  for (const route of routes) {
    if (route.url.length !== minLength) {
      sameLength = false;
    }

    if (route.url.length < minLength) {
      shortestRoute = route;
      minLength = route.url.length;
    }

    if (route.verb === 'POST') {
      postRoute = route;
    }
  }

  if (sameLength) {
    // with same URL size, we keep the POST route
    return postRoute;
  }

  // with differents URL sizes, we keep the shortest because URL params
  // will be in the query string
  return shortestRoute;
}

module.exports = HttpWrapper;
