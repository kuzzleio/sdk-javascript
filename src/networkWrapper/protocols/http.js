'use strict';

const
  XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest,
  AbtractWrapper = require('./abstract/common');

class HttpWrapper extends AbtractWrapper {

  constructor(host, options) {
    super(host, options);
    Object.defineProperties(this, {
      urlPrefix: {
        value: (this.ssl ? 'https://' : 'http://') + this.host + ':' + this.port,
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
    const
      url = this.urlPrefix,
      xhr = new XMLHttpRequest(),
      method = 'GET';

    xhr.open(method, url);

    xhr.onload = () => {
      const response = JSON.parse(xhr.responseText);
      this.httpRoutes = response.result.serverInfo.kuzzle.api.routes;
      this.clientConnected();
    };

    xhr.send();
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
      xhr = new XMLHttpRequest(),
      method = route.http.verb,
      regex = /\/\:([^\/]*)/;

    let
      matches,
      url = route.http.url;

    while (matches = regex.exec(url)) {
      url = url.replace(regex, '/' + payload[ matches[1] ]);
    }

    xhr.open(method, this.urlPrefix + url);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = () => {
      const response = JSON.parse(xhr.responseText);
      this.emitEvent(payload.requestId, response);
    };

    xhr.send(JSON.stringify(payload.body));
  }

  /**
   * Closes the connection
   */
  close () {
    this.disconnect();
  }

}

module.exports = HttpWrapper;
