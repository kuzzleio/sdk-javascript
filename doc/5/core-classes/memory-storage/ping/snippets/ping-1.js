// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.ping(function (err, response) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.pingPromise()
  .then(response => {
    // resolved once the action has completed
  });
