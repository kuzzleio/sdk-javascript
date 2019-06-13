// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.dbsize(function (err, count) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.dbsize()
  .then(count => {
    // resolved once the action has completed
  });
