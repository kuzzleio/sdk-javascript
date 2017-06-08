function SocketIO(host, port, ssl) {
  this.host = host;
  this.port = port;
  this.ssl = ssl;
  this.socket = null;
  this.wasConnected = false;
  this.forceDisconnect = false;
  this.handlers = {
    connect: [],
    reconnect: [],
    connectError: [],
    disconnect: []
  };
  this.retrying = false;

  /**
   * Creates a new socket from the provided arguments
   *
   * @constructor
   * @param {boolean} autoReconnect
   * @param {int} reconnectionDelay
   */
  this.connect = function (autoReconnect, reconnectionDelay) {
    var self = this;

    this.socket = window.io((this.ssl ? 'https://' : 'http://') + this.host + ':' + this.port, {
      reconnection: autoReconnect,
      reconnectionDelay: reconnectionDelay,
      forceNew: true
    });

    this.socket.on('connect', function() {
      if (self.wasConnected) {
        self.handlers.reconnect.forEach(function(handler) {
          handler();
        });
      }
      else {
        self.handlers.connect.forEach(function(handler) {
          handler();
        });
      }

      self.wasConnected = true;
    });

    this.socket.on('connect_error', function(error) {
      onClientNetworkError(self, autoReconnect, reconnectionDelay, error);
    });

    this.socket.on('disconnect', function() {
      var error;

      if (self.forceDisconnect) {
        self.handlers.disconnect.forEach(function(handler) {
          handler();
        });
      }
      else {
        error = new Error('An error occurred, this may due that kuzzle was not ready yet');
        error.status = 500;

        onClientNetworkError(self, autoReconnect, reconnectionDelay, error);
      }

      self.forceDisconnect = false;
    });
  };

  /**
   * Fires the provided callback whence a connection is established
   *
   * @param {function} callback
   */
  this.onConnect = function (callback) {
    if (this.handlers.connect.indexOf(callback) === -1) {
      this.handlers.connect.push(callback);
    }
  };

  /**
   * Fires the provided callback whenever a connection error is received
   * @param {function} callback
   */
  this.onConnectError = function (callback) {
    if (this.handlers.connectError.indexOf(callback) === -1) {
      this.handlers.connectError.push(callback);
    }
  };

  /**
   * Fires the provided callback whenever a disconnection occurred
   * @param {function} callback
   */
  this.onDisconnect = function (callback) {
    if (this.handlers.disconnect.indexOf(callback) === -1) {
      this.handlers.disconnect.push(callback);
    }
  };

  /**
   * Fires the provided callback whenever a connection has been reestablished
   * @param {function} callback
   */
  this.onReconnect = function (callback) {
    if (this.handlers.reconnect.indexOf(callback) === -1) {
      this.handlers.reconnect.push(callback);
    }
  };

  /**
   * Registers a callback on a room. Once 1 message is received, fires the
   * callback and unregister it afterward.
   *
   * @param {string} roomId
   * @param {function} callback
   */
  this.once = function (roomId, callback) {
    this.socket.once(roomId, callback);
  };

  /**
   * Registers a callback on a room.
   *
   * @param {string} roomId
   * @param {function} callback
   */
  this.on = function (roomId, callback) {
    this.socket.on(roomId, callback);
  };

  /**
   * Unregisters a callback from a room.
   *
   * @param {string} roomId
   * @param {function} callback
   */
  this.off = function (roomId, callback) {
    this.socket.off(roomId, callback);
  };


  /**
   * Sends a payload to the connected server
   *
   * @param {Object} payload
   */
  this.send = function (payload) {
    this.socket.emit('kuzzle', payload);
  };

  /**
   * Closes the connection
   */
  this.close = function () {
    this.forceDisconnect = true;

    this.socket.close();
    this.socket = null;
  };
}

/**
 * Called when the connection closes with an error state
 *
 * @param {SocketIO}
 * @param {boolean} autoReconnect
 * @param {number} reconnectionDelay
 * @param {Error} error
 */
function onClientNetworkError(socketio, autoReconnect, reconnectionDelay, error) {
  if (autoReconnect && !socketio.retrying && !socketio.stopRetryingToConnect) {
    socketio.retrying = true;
    setTimeout(function () {
      socketio.retrying = false;
      socketio.connect(autoReconnect, reconnectionDelay);
    }, reconnectionDelay);
  }

  socketio.handlers.connectError.forEach(function(handler) {
    handler(error);
  });
}


module.exports = SocketIO;
