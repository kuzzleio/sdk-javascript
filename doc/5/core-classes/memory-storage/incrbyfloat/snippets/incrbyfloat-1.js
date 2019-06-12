// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.incrbyfloat('key', -3.14159, function (err, value) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.incrbyfloatPromise('key', -3.14159)
  .then(value => {
    // resolved once the action has completed
  });
