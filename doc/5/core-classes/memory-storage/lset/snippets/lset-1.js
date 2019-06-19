// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.lset('key', 2, 'bar', function (err) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.lsetPromise('key', 2, 'bar')
  .then(() => {
    // resolved once the action has completed
  });
