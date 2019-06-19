// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.hget('key', 'field1', function (err, value) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.hgetPromise('key', 'field1')
  .then(value => {
    // resolved once the action has completed
  });
