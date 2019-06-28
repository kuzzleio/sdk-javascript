// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.sdiff('key', ['key1', 'key2', '...'], function (err, diff) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.sdiffPromise('key', ['key1', 'key2', '...'])
  .then(diff => {
    // resolved once the action has completed
  });
