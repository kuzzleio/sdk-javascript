// load the Kuzzle SDK module
/* snippet:start:1 */
import { Kuzzle, WebSocket } from 'kuzzle-sdk';
/* snippet:end */

// instantiate a Kuzzle client
/* snippet:start:2 */
const kuzzle = new Kuzzle(new WebSocket('kuzzle'));
/* snippet:end */

// add a listener to detect any connection problems
/* snippet:start:3 */
kuzzle.on('networkError', error => {
  console.error(`Network Error: ${error}`);
});
/* snippet:end */

/* snippet:start:4 */
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
/* snippet:end */

run();
