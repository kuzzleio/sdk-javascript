// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.zrank('key', 'foo', function (err, position) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.zrankPromise('key', 'foo')
  .then(position => {
    // resolved once the action has completed
  });
