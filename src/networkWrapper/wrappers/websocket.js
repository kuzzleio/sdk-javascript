var
  KuzzleEventEmitter = require('../../eventEmitter');

function WSNode(host, port, ssl) {
  var self = this;
  KuzzleEventEmitter.call(this);

  this.WebSocket = typeof WebSocket !== 'undefined' ? WebSocket : require('ws');
  this.host = host;
  this.port = port;
  this.ssl = ssl;
  this.client = null;
  this.wasConnected = false;
  this.retrying = false;
  this.lasturl = null;
  this.stopRetryingToConnect = false;

  /**
   * Creates a new socket from the provided arguments
   *
   * @constructor
   * @param {boolean} autoReconnect
   * @param {int} reconnectionDelay
   * @returns {Object} Socket
   */
  this.connect = function (autoReconnect, reconnectionDelay) {
    var
      url = (this.ssl ? 'wss://' : 'ws://') + this.host + ':' + this.port,
      options = typeof window !== 'undefined' ? undefined : {perMessageDeflate: false};

    if (url !== this.lasturl) {
      self.wasConnected = false;
      this.lasturl = url;
    }

    this.client = new this.WebSocket(url, options);

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

    this.client.onclose = function (code, message) {
      if (code === 1000) {
        self.emitEvent('disconnect');
      }
      else {
        onClientError.call(self, autoReconnect, reconnectionDelay, message);
      }
    };

    this.client.onerror = function (error) {
      onClientError.call(self, autoReconnect, reconnectionDelay, error);
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
    this.removeAllListeners();
    this.wasConnected = false;
    this.client.close();
    this.client = null;
    self.stopRetryingToConnect = true;
  };
}
WSNode.prototype = Object.create(KuzzleEventEmitter.prototype);
WSNode.prototype.constructor = WSNode;


/**
 * Called when the connection closes with an error state
 *
 * @param {boolean} autoReconnect
 * @param {number} reconnectionDelay
 * @param {string|Object} message
 */
function onClientError(autoReconnect, reconnectionDelay, message) {
  var self = this;

  if (autoReconnect && !self.retrying && !self.stopRetryingToConnect) {
    self.retrying = true;
    setTimeout(function () {
      self.retrying = false;
      self.connect(autoReconnect, reconnectionDelay);
    }, reconnectionDelay);
  }

  self.emitEvent('networkError', new Error(message));
}

module.exports = WSNode;
