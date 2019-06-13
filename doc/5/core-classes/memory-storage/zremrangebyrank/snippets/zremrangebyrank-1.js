// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.zremrangebyrank('key', 1, 2, function (err, count) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.zremrangebyrankPromise('key', 1, 2)
  .then(count => {
    // resolved once the action has completed
  });
