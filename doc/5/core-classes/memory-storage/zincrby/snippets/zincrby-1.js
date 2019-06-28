// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.zincrby('key', 'foo', 3.14159, function (err, value) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.zincrbyPromise('key', 'foo', 3.14159)
  .then(value => {
    // resolved once the action has completed
  });
