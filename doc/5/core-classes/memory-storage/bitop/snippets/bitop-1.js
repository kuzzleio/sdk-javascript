// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.bitop('key', 'AND', ['srckey1', 'srckey2', '...'], function (err, length) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.bitopPromise('key', 'AND', ['srckey1', 'srckey2', '...'])
  .then(length => {
    // resolved once the action has completed
  });
