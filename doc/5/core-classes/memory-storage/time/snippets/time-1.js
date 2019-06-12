// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.time(function (err, result) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.timePromise()
  .then(result => {
    // resolved once the action has completed
  });
