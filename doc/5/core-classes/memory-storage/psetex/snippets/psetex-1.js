// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.psetex('key', 'value', 42000, function (err) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.psetexPromise('key', 'value', 42000)
  .then(() => {
    // resolved once the action has completed
  });
