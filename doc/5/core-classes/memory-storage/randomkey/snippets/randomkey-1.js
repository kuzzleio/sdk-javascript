// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.randomkey(function (err, key) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.randomkeyPromise()
  .then(key => {
    // resolved once the action has completed
  });
