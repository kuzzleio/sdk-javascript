/**
 *
 * @param address
 * @param wsPort
 * @param ioPort
 * @returns {Object} tnstantiated WebSocket/Socket.IO object
 */

function network(address, wsPort, ioPort) {
  // Web browser / NodeJS websocket handling
  if (typeof window !== 'undefined') {
    // use native websockets if the browser supports it
    if (typeof WebSocket !== 'undefined' || typeof MozWebSocket !== 'undefined') {
      return new (require('./wrappers/wsbrowsers'))(address, wsPort);
    }
    // otherwise fallback to socket.io, if available
    else if (window.io) {
      return new (require('./wrappers/socketio'))(address, ioPort);
    }

    throw new Error('Aborting: no websocket support detected and no socket.io library loaded either.');
  }

  return new (require('./wrappers/wsnode'))(address, wsPort);
}

module.exports = network;
