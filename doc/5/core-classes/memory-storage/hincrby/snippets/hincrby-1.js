// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.hincrby('key', 'field', 42, function (err, value) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.hincrbyPromise('key', 'field', 42)
  .then(value => {
    // resolved once the action has completed
  });
