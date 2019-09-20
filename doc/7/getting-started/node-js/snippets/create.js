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

// Adds a listener to detect connection problems
kuzzle.on('networkError', error => {
  console.error('Network Error:', error);
});

const run = async () => {
  try {
    // Connects to the Kuzzle server
    await kuzzle.connect();

    // Creates a document
    const driver = {
      name: 'Sirkis',
      birthday: '1959-06-22',
      license: 'B'
    };

    await kuzzle.document.create('nyc-open-data', 'yellow-taxi', driver);
    console.log('New document successfully created!');
  } catch (error) {
    console.error(error.message);
  } finally {
    kuzzle.disconnect();
  }
};

run();
