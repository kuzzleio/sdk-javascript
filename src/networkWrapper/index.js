/**
 *
 * @param protocol
 * @param host
 * @param options
 * @returns {AbstractWrapper} Instantiated WebSocket/Socket.IO object
 */

function network (protocol, options) {
  switch (protocol) {
    case 'http':
      return new (require('./protocols/http'))(options);
    case 'websocket':
      if (typeof window !== 'undefined' && typeof WebSocket === 'undefined') {
        throw new Error('Aborting: no websocket support detected.');
      }
      return new (require('./protocols/websocket'))(options);
    case 'socketio':
      if (!window.io) {
        throw new Error('Aborting: no socket.io library loaded.');
      }
      return new (require('./protocols/socketio'))(options);
    default:
      throw new Error('Aborting: unknown protocol "' + protocol + '" (only "http", "websocket" and "socketio" are available).');
  }
}

module.exports = network;
