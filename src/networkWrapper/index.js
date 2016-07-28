function network() {
  // Web browser / NodeJS websocket handling
  if (typeof window !== 'undefined') {
    // use native websockets if the browser supports it
    if (WebSocket) {
      return new (require('./wrappers/wsbrowsers'))();
    }
    // otherwise fallback to socket.io, if available
    else if (window.io) {
      return new (require('./wrappers/socketio'))();
    }

    throw new Error('Aborting: no websocket support detected and no socket.io library loaded either.');
  }

  return new (require('./wrappers/wsnode'))();
}

module.exports = network;
