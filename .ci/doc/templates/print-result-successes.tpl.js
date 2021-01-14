// Loads the Kuzzle SDK module and the websocket protocol
const {
  Kuzzle,
  WebSocket
} = require('kuzzle-sdk');

// Instantiates a Kuzzle client
const
  kuzzle = new Kuzzle(
    new WebSocket('kuzzle', { autoReconnect: false, pingInterval: 2000 })
  );

// Adds a listener to detect connection problems
kuzzle.on('networkError', error => {
  console.error(`Network Error: ${error.message}`);
});

(async () => {
  let result;
  try {
    await kuzzle.connect();
  } catch (error) {
    console.log(`Cannot connect to Kuzzle: ${error.message}`);
  }
  [snippet-code] finally {
    kuzzle.disconnect();
  }
  for (const elem of result.successes) {
    console.log(elem);
  }
})();
