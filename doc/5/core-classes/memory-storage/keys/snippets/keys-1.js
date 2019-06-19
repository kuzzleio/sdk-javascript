// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.keys('foo*', function (err, keys) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.keysPromise('foo*')
  .then(keys => {
    // resolved once the action has completed
  });
