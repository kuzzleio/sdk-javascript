const {
  Kuzzle,
  WebSocket
} = require('kuzzle-sdk');

// Replace 'kuzzle' with your Kuzzle server hostname (e.g. 'localhost')
const kuzzle = new Kuzzle(
  new WebSocket('kuzzle')
);
