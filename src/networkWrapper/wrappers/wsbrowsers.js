var
  WS = typeof WebSocket !== 'undefined' ? WebSocket : MozWebSocket;

function WSBrowsers(address, port) {
  var self = this;
  this.address = address;
  this.port = port;
  this.client = null;
  this.retrying = false;

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
    this.client = new WS('ws://' + this.address + ':' + this.port);

    this.client.onopen = function () {
      if (self.retrying) {
        poke(self.listeners, 'reconnect');
      }
      else {
        poke(self.listeners, 'connect');
      }
    };

    this.client.onclose = function () {
      poke(self.listeners, 'disconnect');
    };

    this.client.onerror = function () {
      if (autoReconnect) {
        self.retrying = true;
        setTimeout(function () {
          self.connect(autoReconnect, reconnectionDelay);
        }, reconnectionDelay);
      }

      poke(self.listeners, 'error');
    };

    this.client.onmessage = function (payload) {
      var data = JSON.parse(payload.data);

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
        if (this.listeners[roomId].length === 1) {
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

    this.retrying = false;
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
  listeners[roomId].forEach(function (listener, index) {
    listener.fn(payload);

    if (!listener.keep) {
      if (listeners[roomId].length > 1) {
        listeners[roomId].splice(index, 1);
      }
      else {
        delete listeners[roomId];
      }
    }
  });
}

module.exports = WSBrowsers;
