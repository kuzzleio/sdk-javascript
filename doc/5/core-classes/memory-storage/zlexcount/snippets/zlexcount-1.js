// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.zlexcount('key', '[b', '[f' function (err, count) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.zlexcountPromise('key', '[b', '[f')
  .then(count => {
    // resolved once the action has completed
  });
