'use strict';

const staticHttpRoutes = require('./routes.json');
const { KuzzleAbstractProtocol } = require('./abstract/Base');

class HttpProtocol extends KuzzleAbstractProtocol {
  constructor(host, options = {}) {
    super(host, options, 'http');

    if (typeof host !== 'string' || host === '') {
      throw new Error('host is required');
    }

    this._routes = {};

    this._timeout = options.timeout || 0;

    this.customRoutes = options.customRoutes || {};

    for (const controller of Object.keys(this.customRoutes)) {
      const definition = this.customRoutes[controller];

      for (const action of Object.keys(definition)) {
        const route = definition[action];

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

  get timeout () {
    return this._timeout;
  }

  set timeout (timeout) {
    this._timeout = timeout;
  }

  /**
   * Connect to the server
   */
  connect () {
    if (this.state === 'ready') {
      return Promise.resolve();
    }

    return this._sendHttpRequest('GET', '/_publicApi')
      .then(({ result, error }) => {
        if (! error) {
          this._routes = this._constructRoutes(result);

          return;
        }

        if (error.status === 401 || error.status === 403) {
          this._warn('"server:publicApi" route is restricted for anonymous user.');
          this._warn('This route is used by the HTTP protocol to build API URLs.');
          this._warn('Fallback to static routes, some API routes may be unavailable as well as plugin custom routes');

          // fallback to static http routes
          this._routes = staticHttpRoutes;

          return;
        } else if (error.status === 404) {
          // fallback to server:info route
          // server:publicApi is only available since Kuzzle 1.9.0
          return this._sendHttpRequest('GET', '/')
            .then(({ result: res, error: err }) => {
              if (! err) {
                this._routes = this._constructRoutes(res.serverInfo.kuzzle.api.routes);
                this._staticRoutes = false;

                return;
              }

              if (err.status !== 401 && err.status !== 403) {
                throw err;
              }

              this._warn('"server:info" route is restricted for anonymous user.');
              this._warn('This route is used by the HTTP protocol to build API URLs.');
              this._warn('If you want to expose your API routes without disclosing server information you can use "server:publicApi" (available in Kuzzle 1.9.0).');
              this._warn('Fallback to static routes, some API routes may be unavailable as well as plugin custom routes');

              // fallback to static http routes
              this._routes = staticHttpRoutes;
            });
        }

        throw error;
      })
      .then(() => {
        this._routes = Object.assign(this._routes, this.customRoutes);

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
  send (data, options = {}) {
    const route = this.routes[data.controller]
      && this.routes[data.controller][data.action];

    if (! route) {
      const error = new Error(`No URL found for "${data.controller}:${data.action}".`);
      this.emit(data.requestId, { status: 400, error });
      return;
    }

    const method = options.verb || route.verb;

    const payload = {
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
    };
    const queryArgs = {};

    for (const key of Object.keys(data)) {
      const value = data[key];

      if (key === 'body') {
        if (method === 'GET') {
          Object.assign(queryArgs, value);
        }
        else {
          payload.body = JSON.stringify(value);
        }
      }
      else if (key === 'jwt') {
        payload.headers.authorization = 'Bearer ' + value;
      }
      else if (key === 'volatile') {
        payload.headers['x-kuzzle-volatile'] = JSON.stringify(value);
      }
      else if (Object.prototype.hasOwnProperty.call(payload, key)) {
        payload[key] = value;
      }
      else if (value !== undefined && value !== null) {
        queryArgs[key] = value;
      }
    }

    const regex = /\/:([^/]*)/;

    let url = route.url;
    let matches = regex.exec(url);

    while (matches) {
      const urlParam = data[ matches[1] ];

      // check if an url param is missing (eg: "/:index/_create)
      if (!urlParam) {
        const error = new Error(`Missing URL param "${matches[1]}" in "${matches.input}"`);

        this.emit(payload.requestId, { status: 400, error });
        return;
      }

      url = url.replace(regex, `/${encodeURIComponent(data[matches[1]])}`);

      delete(queryArgs[ matches[1] ]);

      matches = regex.exec(url);
    }

    // inject queryString arguments:
    const queryString = [];

    for (const key of Object.keys(queryArgs)) {
      let value = queryArgs[key];
      const encodedKey = encodeURIComponent(key);

      if (Array.isArray(value)) {
        queryString.push(`${encodedKey}=${encodeURIComponent(value.join())}`);
      }
      else if (typeof value === 'boolean') {
        // In Kuzzle, an optional boolean option is set to true if present in
        // the querystring, and false if absent.
        // As there is no boolean type in querystrings, encoding a boolean
        // option "foo=false" in it will make Kuzzle consider it as truthy.
        if (value === true) {
          queryString.push(encodedKey);
        }
      }
      else {
        value = typeof value === 'object' ? JSON.stringify(value) : value;
        queryString.push(`${encodedKey}=${encodeURIComponent(value)}`);
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
        body: payload.body,
        timeout: this._timeout
      })
        .then(response => JSON.parse(response.body));
    }

    // Browser implementation, using XMLHttpRequest:
    return new Promise((resolve, reject) => {
      const
        xhr = new XMLHttpRequest(),
        url = `${this.protocol}://${this.host}:${this.port}${path}`;

      xhr.timeout = this._timeout;

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
    const apiRoutes = Object.keys(publicApi)
      .map(key => [key, publicApi[key]])
      .reduce((routes, [controller, definition]) => {
        routes[controller] = {};

        for (const action of Object.keys(definition)) {
          const { http } = definition[action];

          if (http && http.length === 1) {
            routes[controller][action] = http[0];
          }
          else if (http && http.length > 1) {
            // We need this ugly fix because the document:search route can also
            // be accessed in GET with this url: "/:index/:collection"
            // But to send a query, we need to pass it in the body so we need POST
            // so we can change the verb but then POST on "/:index/:collection"
            // is the collection:update method (document:search is "/:index/:collection/_search")
            if (controller === 'document' && action === 'search') {
              routes[controller][action] = getPostRoute(http);
            }
            else {
              routes[controller][action] = getCorrectRoute(http);
            }
          }
        }

        return routes;
      }, {});

    for (const controller of Object.keys(this.customRoutes)) {
      apiRoutes[controller] = this.customRoutes[controller];
    }

    return apiRoutes;
  }

  _warn (message) {
    console.warn(message); // eslint-disable-line no-console
  }
}

function getPostRoute (routes) {
  return routes[0].verb === 'POST' ? routes[0] : routes[1];
}

function getCorrectRoute (routes) {
  let
    shortestRoute = routes[0],
    getRoute,
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

    if (route.verb === 'GET') {
      getRoute = route;
    }
  }

  // with same URL size, we keep the GET route
  // with differents URL sizes, we keep the shortest because URL params
  // will be in the query string
  return sameLength ? getRoute : shortestRoute;
}

module.exports = HttpProtocol;
