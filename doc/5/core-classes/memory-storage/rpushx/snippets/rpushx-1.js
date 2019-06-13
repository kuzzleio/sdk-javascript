// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.rpushx('key', 'foo', function (err, count) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.rpushxPromise('key', 'foo')
  .then(count => {
    // resolved once the action has completed
  });
