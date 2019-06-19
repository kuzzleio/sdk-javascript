// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.getbit('key', 10, function (err, bit) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.getbitPromise('key', 10)
  .then(bit => {
    // resolved once the action has completed
  });
