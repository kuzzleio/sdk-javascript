// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.sdiffstore('key', ['key1', 'key2', '...'], 'destination', function (err, count) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.sdiffstorePromise('key', ['key1', 'key2', '...'], 'destination')
  .then(count => {
    // resolved once the action has completed
  });
