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

// Adds a listener to detect any connection problems
kuzzle.on('networkError', error => {
  console.error(`Network Error: ${error.message}`);
});

(async function run () {
  try {
    await kuzzle.connect();
  } catch (error) {
    console.log(`Can not connect to Kuzzle: ${error.message}`);
  }
  try {
    [snippet-code]
    console.log('Success');
  } catch (e) {
    console.log(e);
  } finally {
    kuzzle.disconnect();
  }
})();
