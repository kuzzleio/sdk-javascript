// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.del(['key1', 'key2', '...'], function (err, count) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.delPromise(['key1', 'key2', '...'])
  .then(count => {
    // resolved once the action has completed
  });
