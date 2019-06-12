// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.decr('key', function (err, value) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.decrPromise('key')
  .then(value => {
    // resolved once the action has completed
  });
