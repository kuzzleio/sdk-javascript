function WSNode(host, port, ssl) {
  var self = this;
  this.WebSocket = typeof WebSocket !== 'undefined' ? WebSocket : require('ws');
  this.host = host;
  this.port = port;
  this.ssl = ssl;
  this.client = null;
  this.wasConnected = false;
  this.retrying = false;
  this.lasturl = null;

  /*
   Listeners are stored using the following format:
   roomId: {
   fn: callback_function,
   once: boolean
   }
   */
  this.listeners = {
    error: [],
    connect: [],
    disconnect: [],
    reconnect: []
  };

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
        poke(self.listeners, 'reconnect');
      }
      else {
        poke(self.listeners, 'connect');
      }
      self.wasConnected = true;
    };

    this.client.onclose = function (code, message) {
      if (code === 1000) {
        poke(self.listeners, 'disconnect');
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

      if (data.room && self.listeners[data.room]) {
        poke(self.listeners, data.room, data);
      }
    };
  };

  /**
   * Fires the provided callback whence a connection is established
   *
   * @param {function} callback
   */
  this.onConnect = function (callback) {
    this.listeners.connect.push({
      fn: callback,
      keep: true
    });
  };

  /**
   * Fires the provided callback whenever a connection error is received
   * @param {function} callback
   */
  this.onConnectError = function (callback) {
    this.listeners.error.push({
      fn: callback,
      keep: true
    });
  };

  /**
   * Fires the provided callback whenever a disconnection occurred
   * @param {function} callback
   */
  this.onDisconnect = function (callback) {
    this.listeners.disconnect.push({
      fn: callback,
      keep: true
    });
  };

  /**
   * Fires the provided callback whenever a connection has been reestablished
   * @param {function} callback
   */
  this.onReconnect = function (callback) {
    this.listeners.reconnect.push({
      fn: callback,
      keep: true
    });
  };

  /**
   * Registers a callback on a room. Once 1 message is received, fires the
   * callback and unregister it afterward.
   *
   * @param {string} roomId
   * @param {function} callback
   */
  this.once = function (roomId, callback) {
    if (!this.listeners[roomId]) {
      this.listeners[roomId] = [];
    }

    this.listeners[roomId].push({
      fn: callback,
      keep: false
    });
  };

  /**
   * Registers a callback on a room.
   *
   * @param {string} roomId
   * @param {function} callback
   */
  this.on = function (roomId, callback) {
    if (!this.listeners[roomId]) {
      this.listeners[roomId] = [];
    }

    this.listeners[roomId].push({
      fn: callback,
      keep: true
    });
  };

  /**
   * Unregisters a callback from a room.
   *
   * @param {string} roomId
   * @param {function} callback
   */
  this.off = function (roomId, callback) {
    var index;

    if (this.listeners[roomId]) {
      index = this.listeners[roomId].findIndex(function (listener) {
        return listener.fn === callback;
      });

      if (index !== -1) {
        if (this.listeners[roomId].length === 1 && ['error', 'connect', 'disconnect', 'reconnect'].indexOf(roomId) === -1) {
          delete this.listeners[roomId];
        }
        else {
          this.listeners[roomId].splice(index, 1);
        }
      }
    }
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
    this.listeners = {
      error: [],
      connect: [],
      disconnect: [],
      reconnect: []
    };

    this.wasConnected = false;
    this.client.close();
    this.client = null;
  };
}

/**
 * Executes all registered listeners in the provided
 * "listeners" structure.
 *
 * Listeners are of the following format:
 * [
 *    { fn: callback, once: boolean },
 *    ...
 * ]
 *
 * @private
 * @param {Object} listeners
 * @param {string} roomId
 * @param {Object} [payload]
 */
function poke (listeners, roomId, payload) {
  var
    i,
    length = listeners[roomId].length;

  for (i = 0; i < length; ++i) {
    listeners[roomId][i].fn(payload);

    if (!listeners[roomId][i].keep) {
      if (listeners[roomId].length > 1) {
        listeners[roomId].splice(i, 1);
        --i;
        --length;
      }
      else {
        delete listeners[roomId];
      }
    }
  }
}

/**
 * Called when the connection closes with an error state
 *
 * @param {boolean} autoReconnect
 * @param {number} reconnectionDelay
 * @param {string|Object} message
 */
function onClientError(autoReconnect, reconnectionDelay, message) {
  var self = this;

  if (autoReconnect && !self.retrying) {
    self.retrying = true;
    setTimeout(function () {
      self.retrying = false;
      self.connect(autoReconnect, reconnectionDelay);
    }, reconnectionDelay);
  }

  poke(self.listeners, 'error', message);
}

module.exports = WSNode;
