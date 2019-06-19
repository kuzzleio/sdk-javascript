// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.lindex('key', 3, function (err, value) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.lindexPromise('key', 3)
  .then(value => {
    // resolved once the action has completed
  });
