// Loads the WebSocket protocol
const
  {
    Kuzzle,
    WebSocket
  } = require('kuzzle-sdk');

const options = {
  autoReconnect: false
};

// Instantiates the websocket protocol
const websocketProtocol = new WebSocket('kuzzle', options);

// Use it with Kuzzle
const kuzzle = new Kuzzle(websocketProtocol);
