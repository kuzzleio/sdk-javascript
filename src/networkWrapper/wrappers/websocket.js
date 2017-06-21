var
  RTWrapper = require('./abstract/realtime');

function WSNode(host, options) {
  var self = this;
  RTWrapper.call(this, host, options);

  this.WebSocket = typeof WebSocket !== 'undefined' ? WebSocket : require('ws');
  this.client = null;
  this.wasConnected = false;
  this.retrying = false;
  this.lasturl = null;
  this.stopRetryingToConnect = false;

  /**
   * Connect to the websocket server
   */
  this.connect = function () {
    var
      url = (this.ssl ? 'wss://' : 'ws://') + this.host + ':' + this.port,
      opts = typeof window !== 'undefined' ? undefined : {perMessageDeflate: false};

    RTWrapper.prototype.connect.call(this);

    if (url !== this.lasturl) {
      self.wasConnected = false;
      this.lasturl = url;
    }

    this.client = new this.WebSocket(url, opts);

    this.client.onopen = function () {
      if (self.wasConnected) {
        self.emitEvent('reconnect');
      }
      else {
        self.emitEvent('connect');
      }
      self.wasConnected = true;
      self.stopRetryingToConnect = false;
    };

    this.client.onclose = function (closeEvent, message) {
      var error;
      var status;
      var reason = message;

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
        self.emitEvent('disconnect');
      }
      else {
        error = new Error(reason);
        error.status = status;

        onClientNetworkError(self, error);
      }
    };

    this.client.onerror = function (error) {
      if (!(error instanceof Error)) {
        error = new Error(error);
      }

      onClientNetworkError(self, error);
    };

    this.client.onmessage = function (payload) {
      var data = JSON.parse(payload.data || payload);

      if (data.room) {
        self.emitEvent(data.room, data);
      }
      else {
        self.emitEvent('discarded', data);
      }
    };
  };

  /**
   * Fires the provided callback whence a connection is established
   *
   * @param {function} callback
   */
  this.onConnect = function (callback) {
    this.addListener('connect', callback);
  };

  /**
   * Fires the provided callback whenever a connection error is received
   * @param {function} callback
   */
  this.onConnectError = function (callback) {
    this.addListener('networkError', callback);
  };

  /**
   * Fires the provided callback whenever a disconnection occurred
   * @param {function} callback
   */
  this.onDisconnect = function (callback) {
    this.addListener('disconnect', callback);
  };

  /**
   * Fires the provided callback whenever a connection has been reestablished
   * @param {function} callback
   */
  this.onReconnect = function (callback) {
    this.addListener('reconnect', callback);
  };

  /**
   * Sends a payload to the connected server
   *
   * @param {Object} payload
   */
  this.send = function (payload) {
    if (this.client && this.client.readyState === this.client.OPEN) {
      this.client.send(JSON.stringify(payload));
    }
  };

  /**
   * Closes the connection
   */
  this.close = function () {
    this.state = 'disconnected';
    this.removeAllListeners();
    this.wasConnected = false;
    if (this.client) {
      this.client.close();
    }
    this.client = null;
    self.stopRetryingToConnect = true;
  };
}
WSNode.prototype = Object.create(RTWrapper.prototype);

/**
 * Called when the connection closes with an error state
 *
 * @param {WSNode}
 * @param {boolean} autoReconnect
 * @param {number} reconnectionDelay
 * @param {Error} error
 */
function onClientNetworkError(ws, error) {
  if (ws.autoReconnect && !ws.retrying && !ws.stopRetryingToConnect) {
    ws.retrying = true;
    setTimeout(function () {
      ws.retrying = false;
      ws.connect(ws.host);
    }, ws.reconnectionDelay);
  }

  ws.emitEvent('networkError', error);
}

module.exports = WSNode;
