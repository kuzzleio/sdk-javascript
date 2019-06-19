// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.object('key', 'encoding', function (err, property) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.objectPromise('key', 'encoding')
  .then(property => {
    // resolved once the action has completed
  });
