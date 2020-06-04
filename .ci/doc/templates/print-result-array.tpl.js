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

(async () => {
  try {
    await kuzzle.connect();
  } catch (error) {
    console.log(`Can not connect to Kuzzle: ${error.message}`);
  }
  try {
    [snippet-code]
    console.log(result.successes);
    for (const elem of result.successes) {
      console.log(elem);
    }
  } catch (error) {
    console.error(error.message);
  } finally {
    kuzzle.disconnect();
  }
})();
