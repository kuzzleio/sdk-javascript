// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.incr('key', function (err, value) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.incrPromise('key')
  .then(value => {
    // resolved once the action has completed
  });
