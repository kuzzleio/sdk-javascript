// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.hgetall('key', function (err, hash) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.hgetallPromise('key')
  .then(hash => {
    // resolved once the action has completed
  });
