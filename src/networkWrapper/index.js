/**
 *
 * @param protocol
 * @param host
 * @param options
 * @returns {Object} Instantiated WebSocket/Socket.IO object
 */

function network(protocol, host, options) {
  switch (protocol) {
    case 'websocket':
      if (typeof window !== 'undefined' && typeof WebSocket === 'undefined') {
        throw new Error('Aborting: no websocket support detected.');
      }
      return new (require('./wrappers/websocket'))(host, options);
    case 'socketio':
      if (!window.io) {
        throw new Error('Aborting: no socket.io library loaded.');
      }
      return new (require('./wrappers/socketio'))(host, options);
    default:
      throw new Error('Aborting: unknown protocol "' + protocol + '" (only "websocket" and "socketio" are available).');
  }
}

module.exports = network;
