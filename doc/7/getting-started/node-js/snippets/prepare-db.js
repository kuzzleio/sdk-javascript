const run = async () => {
  try {
    // Connects to the Kuzzle server
    await kuzzle.connect();

    // Creates an index
    await kuzzle.index.create('nyc-open-data');

    // Creates a collection
    await kuzzle.collection.create('nyc-open-data', 'yellow-taxi');

    console.log('nyc-open-data/yellow-taxi ready!');
  } catch (error) {
    console.error(error.message);
  } finally {
    kuzzle.disconnect();
  }
};

run();
