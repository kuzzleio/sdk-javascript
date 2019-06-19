// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.zremrangebylex('key', '[b', '(f', function (err, count) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.zremrangebylexPromise('key', '[b', '(f')
  .then(count => {
    // resolved once the action has completed
  });
