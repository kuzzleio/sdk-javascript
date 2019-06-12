// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.touch(['key1', 'key2', '...'], function (err, count) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.touchPromise(['key1', 'key2', '...'])
  .then(count => {
    // resolved once the action has completed
  });
