// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.rename('key', 'newId', function (err) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.renamePromise('key', 'newId')
  .then(() => {
    // resolved once the action has completed
  });
