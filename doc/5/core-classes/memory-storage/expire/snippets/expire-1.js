// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.expire('key', 42, function (err, status) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.expirePromise('key', 42)
  .then(status => {
    // resolved once the action has completed
  });
