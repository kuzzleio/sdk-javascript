// Loads the SocketIO protocol
const
  {
    Kuzzle,
    SocketIO
  } = require('kuzzle-sdk');

const options = {
  autoReconnect: false
};

// Instantiates the SocketIO protocol
const socketIOProtocol = new SocketIO('kuzzle', options);

// Use it with Kuzzle
const kuzzle = new Kuzzle(socketIOProtocol);
