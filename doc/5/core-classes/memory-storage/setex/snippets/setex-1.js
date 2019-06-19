// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.setex('key', 'value', 42, function (err) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.setexPromise('key', 'value', 42)
  .then(() => {
    // resolved once the action has completed
  });
