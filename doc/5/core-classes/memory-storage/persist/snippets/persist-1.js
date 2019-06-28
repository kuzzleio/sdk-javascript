// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.persist('key', function (err, status) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.persistPromise('key')
  .then(status => {
    // resolved once the action has completed
  });
