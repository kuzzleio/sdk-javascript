// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.lrange('key', 0, 1, function (err, values) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.lrangePromise('key', 0, 1)
  .then(values => {
    // resolved once the action has completed
  });
