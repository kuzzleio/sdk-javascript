// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.flushdb(function (err) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.flushdbPromise()
  .then(() => {
    // resolved once the action has completed
  });
