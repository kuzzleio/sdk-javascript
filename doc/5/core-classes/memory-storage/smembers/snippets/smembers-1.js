// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.smembers('key', function (err, members) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.smembersPromise('key')
  .then(members => {
    // resolved once the action has completed
  });
