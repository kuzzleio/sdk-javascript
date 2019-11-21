// Loads the Kuzzle SDK modules
const {
  Kuzzle,
  WebSocket
} = require('kuzzle-sdk');

// Instantiates a Kuzzle client with the WebSocket protocol
// Replace 'kuzzle' with your Kuzzle server hostname (e.g. 'localhost')
const kuzzle = new Kuzzle(
  new WebSocket('kuzzle')
);

// Adds a listener to detect any connection problems
kuzzle.on('networkError', error => {
  console.error('Network Error:', error);
});

const run = async () => {
  try {
    // Connects to the Kuzzle server
    await kuzzle.connect();

    // Defines a filter
    const filter = {
      equals: { license: 'B' }
    };

    // Defines a callback invoked each time a notification is received
    const callback = (notification) => {

      if (notification.type === 'document' && notification.action === 'create') {
        const {
          _source: driver,
          _id: driverId
        } = notification.result;

        console.log(`New driver ${driver.name} with id ${driverId} has B license.`);
        kuzzle.disconnect();
      }
    };

    // Subscribes to document notifications using the above filter
    await kuzzle.realtime.subscribe('nyc-open-data', 'yellow-taxi', filter, callback);

    console.log('Successfully subscribed to document notifications!');
  } catch (error) {
    console.error(error.message);
  }
};

run();
