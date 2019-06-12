// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.hlen('key', function (err, count) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.hlenPromise('key')
  .then(count => {
    // resolved once the action has completed
  });
