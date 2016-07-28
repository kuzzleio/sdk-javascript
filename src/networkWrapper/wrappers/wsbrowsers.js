function WSBrowsers() {
  /**
   * Creates a new socket from the provided arguments
   *
   * @constructor
   * @param {string} url
   * @param {boolean} autoReconnect
   * @param {int} reconnectionDelay
   * @returns {Object} Socket
   */
  this.connect = function (url, autoReconnect, reconnectionDelay) {
    return null;
  };

  /**
   * Fires the provided callback whence a connection is established
   *
   * @param {function} callback
   */
  this.onConnect = function (callback) {
  };

  /**
   * Fires the provided callback whenever a connection error is received
   * @param {function} callback
   */
  this.onConnectError = function (callback) {
  };

  /**
   * Fires the provided callback whenever a disconnection occurred
   * @param {function} callback
   */
  this.onDisconnect = function (callback) {
  };

  /**
   * Fires the provided callback whenever a connection has been reestablished
   * @param {function} callback
   */
  this.onReconnect = function (callback) {
  };

  /**
   * Registers a callback on a room. Once 1 message is received, fires the
   * callback and unregister it afterward.
   *
   * @param {string} roomId
   * @param {function} callback
   */
  this.once = function (roomId, callback) {
  };

  /**
   * Registers a callback on a room.
   *
   * @param {string} roomId
   * @param {function} callback
   */
  this.on = function (roomId, callback) {
  };

  /**
   * Unregisters a callback from a room.
   *
   * @param {string} roomId
   * @param {function} callback
   */
  this.off = function (roomId, callback) {
  };

  /**
   * Sends a payload to the connected server
   *
   * @param {Object} payload
   */
  this.send = function (payload) {
  };

  /**
   * Closes the connection
   */
  this.close = function () {
  };
}

module.exports = WSBrowsers;
