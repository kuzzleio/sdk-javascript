// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.getset('key', 'new value', function (err, oldValue) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.getsetPromise('key', 'new value')
  .then(oldValue => {
    // resolved once the action has completed
  });
