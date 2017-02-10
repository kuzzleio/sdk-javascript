/**
 *
 * @param host
 * @param port
 * @param sslConnection
 * @returns {Object} tnstantiated WebSocket/Socket.IO object
 */

function network(host, port, sslConnection) {
  // Web browser / NodeJS websocket handling
  if (typeof window !== 'undefined') {
    // use native websockets if the browser supports it
    if (typeof WebSocket !== 'undefined') {
      return new (require('./wrappers/websocket'))(host, port, sslConnection);
    }
    // otherwise fallback to socket.io, if available
    else if (window.io) {
      return new (require('./wrappers/socketio'))(host, port, sslConnection);
    }

    throw new Error('Aborting: no websocket support detected and no socket.io library loaded either.');
  }

  return new (require('./wrappers/websocket'))(host, port, sslConnection);
}

module.exports = network;
