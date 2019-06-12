// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.srandmember('key', function (err, members) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.srandmemberPromise('key')
  .then(members => {
    // resolved once the action has completed
  });
