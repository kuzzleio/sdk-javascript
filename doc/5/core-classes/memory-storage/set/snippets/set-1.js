// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.set('key', 'value', function (err) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.setPromise('key', 'value')
  .then(() => {
    // resolved once the action has completed
  });
