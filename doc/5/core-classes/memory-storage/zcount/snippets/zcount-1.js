// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.zcount('key', 2, 3, function (err, count) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.zcountPromise('key', 2, 3)
  .then(count => {
    // resolved once the action has completed
  });
