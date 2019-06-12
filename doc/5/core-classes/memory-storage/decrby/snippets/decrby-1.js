// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.decrby('key', 42, function (err, value) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.decrbyPromise('key', 42)
  .then(value => {
    // resolved once the action has completed
  });
