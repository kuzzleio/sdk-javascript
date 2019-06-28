// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.zrevrangebyscore('key', 2, 3, function (err, members) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.zrevrangebyscorePromise('key', 2, 3)
  .then(members => {
    // resolved once the action has completed
  });
