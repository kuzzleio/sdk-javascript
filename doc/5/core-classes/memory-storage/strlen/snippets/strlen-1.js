// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.strlen('key', function (err, length) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.strlenPromise('key')
  .then(length => {
    // resolved once the action has completed
  });
