// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.pexpire('key', 42000, function (err, status) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.pexpirePromise('key', 42000)
  .then(status => {
    // resolved once the action has completed
  });
