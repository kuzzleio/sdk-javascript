// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.hdel('key', ['field1', 'field2'], function (err, count) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.hdelPromise('key', ['field1', 'field2'])
  .then(count => {
    // resolved once the action has completed
  });
