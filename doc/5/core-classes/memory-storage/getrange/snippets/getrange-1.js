// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.getrange('key', 2, 4, function (err, value) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.getrangePromise('key', 2, 4)
  .then(value => {
    // resolved once the action has completed
  });
