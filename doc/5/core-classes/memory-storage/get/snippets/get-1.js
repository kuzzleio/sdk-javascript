// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.get('key', function (err, value) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.getPromise('key')
  .then(value => {
    // resolved once the action has completed
  });
