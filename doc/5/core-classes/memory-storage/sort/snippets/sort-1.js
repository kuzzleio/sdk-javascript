// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.sort('key', function (err, values) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.sortPromise('key')
  .then(values => {
    // resolved once the action has completed
  });
