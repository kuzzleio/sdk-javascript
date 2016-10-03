/**
 *
 * @param host
 * @param wsPort
 * @param ioPort
 * @param sslConnection
 * @returns {Object} tnstantiated WebSocket/Socket.IO object
 */

function network(host, wsPort, ioPort, sslConnection) {
  // Web browser / NodeJS websocket handling
  if (typeof window !== 'undefined') {
    // use native websockets if the browser supports it
    if (typeof WebSocket !== 'undefined') {
      return new (require('./wrappers/websocket'))(host, wsPort, sslConnection);
    }
    // otherwise fallback to socket.io, if available
    else if (window.io) {
      return new (require('./wrappers/socketio'))(host, ioPort, sslConnection);
    }

    throw new Error('Aborting: no websocket support detected and no socket.io library loaded either.');
  }

  return new (require('./wrappers/websocket'))(host, wsPort, sslConnection);
}

module.exports = network;
