// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.lpushx('key', 'foo', function (err, count) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.lpushxPromise('key', 'foo')
  .then(count => {
    // resolved once the action has completed
  });
