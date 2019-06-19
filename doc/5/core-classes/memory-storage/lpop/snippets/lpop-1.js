// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.lpop('key', function (err, value) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.lpopPromise('key')
  .then(value => {
    // resolved once the action has completed
  });
