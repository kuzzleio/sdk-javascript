// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.pfmerge('key', ['key1', 'key2', '...'], function (err) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.pfmergePromise('key', ['key1', 'key2', '...'])
  .then(() => {
    // resolved once the action has completed
  });
