var
  RTWrapper = require('./abstract/realtime');

function SocketIO(host, options) {
  RTWrapper.call(this, host, options);

  this.socket = null;
  this.forceDisconnect = false;

  /**
   * Connect to the SocketIO server
   *
   */
  this.connect = function () {
    var self = this;
    RTWrapper.prototype.connect.call(this);

    this.socket = window.io((this.ssl ? 'https://' : 'http://') + this.host + ':' + this.port, {
      reconnection: this.autoReconnect,
      reconnectionDelay: this.reconnectionDelay,
      forceNew: true
    });

    this.socket.on('connect', function() {
      self.clientConnected();
    });

    this.socket.on('connect_error', function(error) {
      self.clientNetworkError(error);
    });

    this.socket.on('disconnect', function() {
      var error;

      if (self.forceDisconnect) {
        self.clientDisconnected();
      }
      else {
        error = new Error('An error occurred, this may due that kuzzle was not ready yet');
        error.status = 500;

        self.clientNetworkError(error);
      }

      self.forceDisconnect = false;
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
    this.state = 'disconnected';
    this.socket.close();
    this.socket = null;
  };
}
SocketIO.prototype = Object.create(RTWrapper.prototype);

module.exports = SocketIO;
