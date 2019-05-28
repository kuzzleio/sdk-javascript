const Bluebird = require('bluebird');

// Loads the Kuzzle SDK module and the websocket protocol
const {
  Kuzzle,
  WebSocket
} = require('kuzzle-sdk');

// Instantiates a Kuzzle client
const
  kuzzle = new Kuzzle(
    new WebSocket('kuzzle', { autoReconnect: false })
  );

// Adds a listener to detect any connection problems
kuzzle.on('networkError', error => {
  console.error(`Network Error: ${error.message}`);
});

Bluebird.resolve(
  kuzzle
    .connect()
    .then(() => {
      return [snippet-code]
    })
)
  .catch(() => 'nothing')
  .finally(() => kuzzle.disconnect());
