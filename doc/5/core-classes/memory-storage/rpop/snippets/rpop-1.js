// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.rpop('key', function (err, value) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.rpopPromise('key')
  .then(value => {
    // resolved once the action has completed
  });
