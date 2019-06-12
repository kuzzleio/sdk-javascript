// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.zremrangebyscore('key', 1, 2, function (err, count) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.zremrangebyscorePromise('key', 1, 2)
  .then(count => {
    // resolved once the action has completed
  });
