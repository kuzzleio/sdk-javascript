// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.hexists('key', 'field1', function (err, exists) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.hexistsPromise('key', 'field1')
  .then(exists => {
    // resolved once the action has completed
  });
