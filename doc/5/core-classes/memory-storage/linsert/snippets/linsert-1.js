// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.linsert('key', 'after', 'foo', 'bar', function (err, count) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.linsertPromise('key', 'after', 'foo', 'bar')
  .then(count => {
    // resolved once the action has completed
  });
