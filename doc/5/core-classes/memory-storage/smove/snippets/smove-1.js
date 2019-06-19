// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.smove('key', 'destination', 'member', function (err, status) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.smovePromise('key', 'destination', 'member')
  .then(status => {
    // resolved once the action has completed
  });
