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

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  try {
    await kuzzle.connect();
  } catch (error) {
    console.log(`Cannot connect to Kuzzle: ${error.message}`);
  }

  const consoleLog = console.log;
  const outputs = [];

  console.log = (...args) => {
    outputs.push(...args);
  };

  [snippet-code] finally {
    for (let i = 150; i > 0 && outputs.length <= 0; --i) {
      await sleep(200);
    }

    console.log = consoleLog;
    console.log(...outputs);

    // force exit: do not wait for the event loop to be empty
    process.exit(0);
  }
})();
