// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.lrem('key', 1, 'foo', function (err, count) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.lremPromise('key', 1, 'foo')
  .then(count => {
    // resolved once the action has completed
  });
