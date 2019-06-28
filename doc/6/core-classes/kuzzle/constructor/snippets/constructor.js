// Loads the Kuzzle SDK module
const
  {
    Kuzzle,
    WebSocket,
    Http
  } = require('kuzzle-sdk');

const options = {
  offlineMode: 'auto',
  volatile: { username: 'Gordon' }
};

// Instantiates the SDK with the websocket protocol
const
  kuzzleWs = new Kuzzle(
    new WebSocket('kuzzle'),
    options
  );

// Instantiates the SDK with the http protocol
const
  kuzzleHttp = new Kuzzle(
    new Http('kuzzle')
  );
