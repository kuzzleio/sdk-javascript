// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.sismember('key', 'member', function (err, isMember) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.sismemberPromise('key', 'member')
  .then(isMember => {
    // resolved once the action has completed
  });
