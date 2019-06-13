// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.setnx('key', 'value', function (err, status) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.setnxPromise('key', 'value')
  .then(status => {
    // resolved once the action has completed
  });
