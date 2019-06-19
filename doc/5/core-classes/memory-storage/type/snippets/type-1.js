// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.type('key', function (err, type) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.typePromise('key')
  .then(type => {
    // resolved once the action has completed
  });
