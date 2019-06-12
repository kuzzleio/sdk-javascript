// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.ttl('key', function (err, ttl) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.ttlPromise('key')
  .then(ttl => {
    // resolved once the action has completed
  });
