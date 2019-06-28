// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.zrem('key', ['foo', 'bar', 'baz'], function (err, count) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.zremPromise('key', ['foo', 'bar', 'baz'])
  .then(count => {
    // resolved once the action has completed
  });
