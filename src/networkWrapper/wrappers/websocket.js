const
  RTWrapper = require('./abstract/realtime');

let WebSocketClient;

class WSNode extends RTWrapper {

  constructor(host, options) {
    super(host, options);

    WebSocketClient = typeof WebSocket !== 'undefined' ? WebSocket : require('ws');
    this.client = null;
    this.lasturl = null;
  }

  /**
   * Connect to the websocket server
   */
  connect () {
    const
      url = (this.ssl ? 'wss://' : 'ws://') + this.host + ':' + this.port,
      opts = typeof window !== 'undefined' ? undefined : {perMessageDeflate: false};

    super.connect();

    if (url !== this.lasturl) {
      this.wasConnected = false;
      this.lasturl = url;
    }

    this.client = new WebSocketClient(url, opts);

    this.client.onopen = () => {
      this.clientConnected();
    };

    this.client.onclose = (closeEvent, message) => {
      let
        error,
        status,
        reason = message;

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
        this.clientDisconnected();
      }
      else {
        error = new Error(reason);
        error.status = status;

        this.clientNetworkError(error);
      }
    };

    this.client.onerror = error => {
      if (!(error instanceof Error)) {
        error = new Error(error);
      }

      this.clientNetworkError(error);
    };

    this.client.onmessage = payload => {
      const data = JSON.parse(payload.data || payload);

      if (data.room) {
        this.emitEvent(data.room, data);
      }
      else {
        this.emitEvent('discarded', data);
      }
    };
  }

  /**
   * Sends a payload to the connected server
   *
   * @param {Object} payload
   */
  send (payload) {
    if (this.client && this.client.readyState === this.client.OPEN) {
      this.client.send(JSON.stringify(payload));
    }
  }

  /**
   * Closes the connection
   */
  close () {
    this.state = 'disconnected';
    this.removeAllListeners();
    this.wasConnected = false;
    if (this.client) {
      this.client.close();
    }
    this.client = null;
    this.stopRetryingToConnect = true;
  }
}

module.exports = WSNode;
