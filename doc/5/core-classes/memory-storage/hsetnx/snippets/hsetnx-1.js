// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.hsetnx('key', 'field', 'value', function (err, status) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.hsetnxPromise('key', 'field', 'value')
  .then(status => {
    // resolved once the action has completed
  });
