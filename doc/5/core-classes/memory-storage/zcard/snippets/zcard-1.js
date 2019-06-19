// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.zcard('key', function (err, count) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.zcardPromise('key')
  .then(count => {
    // resolved once the action has completed
  });
