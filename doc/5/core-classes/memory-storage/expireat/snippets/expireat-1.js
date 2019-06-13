// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.expireat('key', 1488372354, function (err, status) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.expireatPromise('key', 1488372354)
  .then(status => {
    // resolved once the action has completed
  });
