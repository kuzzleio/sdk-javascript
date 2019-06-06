// load the Kuzzle SDK module
import { Kuzzle, WebSocket } from 'kuzzle-sdk';

// instantiate a Kuzzle client
const kuzzle = new Kuzzle(new WebSocket('kuzzle'));

// add a listener to detect any connection problems
kuzzle.on('networkError', error => {
  console.error(`Network Error: ${error}`);
});

const run = async () => {
  try {
    // Connect to Kuzzle server
    await kuzzle.connect();

    // Create an index
    await kuzzle.index.create('nyc-open-data');

    // Create a collection
    await kuzzle.collection.create('nyc-open-data', 'yellow-taxi');
    console.log('nyc-open-data/yellow-taxi ready!');
  } catch (error) {
    console.error(error.message);
  } finally {
    kuzzle.disconnect();
  }
};

run();
