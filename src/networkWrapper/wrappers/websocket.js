var
  RTWrapper = require('./abstract/realtime');

function WSNode(host, options) {
  var self = this;
  RTWrapper.call(this, host, options);

  this.WebSocket = typeof WebSocket !== 'undefined' ? WebSocket : require('ws');
  this.client = null;
  this.lasturl = null;

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
      self.clientConnected();
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
        self.clientDisconnected();
      }
      else {
        error = new Error(reason);
        error.status = status;

        self.clientNetworkError(error);
      }
    };

    this.client.onerror = function (error) {
      if (!(error instanceof Error)) {
        error = new Error(error);
      }

      self.clientNetworkError(error);
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

module.exports = WSNode;
