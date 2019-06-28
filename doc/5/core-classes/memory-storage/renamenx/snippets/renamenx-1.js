// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.renamenx('key', 'newId', function (err, status) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.renamenxPromise('key', 'newId')
  .then(status => {
    // resolved once the action has completed
  });
