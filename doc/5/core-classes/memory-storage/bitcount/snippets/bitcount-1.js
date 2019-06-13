// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.bitcount('key', function (err, count) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.bitcountPromise('key')
  .then(count => {
    // resolved once the action has completed
  });
