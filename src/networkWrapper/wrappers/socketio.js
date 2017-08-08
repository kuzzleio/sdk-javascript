const
  RTWrapper = require('./abstract/realtime');

class SocketIO extends RTWrapper {

  constructor(host, options) {
    super(host, options);

    this.socket = null;
    this.forceDisconnect = false;
  }

  /**
   * Connect to the SocketIO server
   *
   */
  connect() {
    super.connect();

    this.socket = window.io((this.ssl ? 'https://' : 'http://') + this.host + ':' + this.port, {
      reconnection: this.autoReconnect,
      reconnectionDelay: this.reconnectionDelay,
      forceNew: true
    });

    this.socket.on('connect', () => {
      this.clientConnected();
    });

    this.socket.on('connect_error', error => {
      this.clientNetworkError(error);
    });

    this.socket.on('disconnect', () => {
      if (this.forceDisconnect) {
        this.clientDisconnected();
      }
      else {
        const error = new Error('An error occurred, this may due that kuzzle was not ready yet');
        error.status = 500;

        this.clientNetworkError(error);
      }

      this.forceDisconnect = false;
    });
  }

  /**
   * Registers a callback on a room. Once 1 message is received, fires the
   * callback and unregister it afterward.
   *
   * @param {string} roomId
   * @param {function} callback
   */
  once(roomId, callback) {
    this.socket.once(roomId, callback);
  }

  /**
   * Registers a callback on a room.
   *
   * @param {string} roomId
   * @param {function} callback
   */
  on(roomId, callback) {
    this.socket.on(roomId, callback);
  }

  /**
   * Unregisters a callback from a room.
   *
   * @param {string} roomId
   * @param {function} callback
   */
  off(roomId, callback) {
    this.socket.off(roomId, callback);
  }


  /**
   * Sends a payload to the connected server
   *
   * @param {Object} payload
   */
  send(payload) {
    this.socket.emit('kuzzle', payload);
  }

  /**
   * Closes the connection
   */
  close() {
    this.forceDisconnect = true;
    this.state = 'disconnected';
    this.socket.close();
    this.socket = null;
  }
}

module.exports = SocketIO;
