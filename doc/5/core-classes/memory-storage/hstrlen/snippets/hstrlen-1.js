// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.hstrlen('key', 'field', function (err, length) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.hstrlenPromise('key', 'field')
  .then(length => {
    // resolved once the action has completed
  });
