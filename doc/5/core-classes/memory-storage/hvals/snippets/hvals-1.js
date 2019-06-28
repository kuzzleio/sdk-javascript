// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.hvals('key', function (err, values) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.hvalsPromise('key')
  .then(values => {
    // resolved once the action has completed
  });
