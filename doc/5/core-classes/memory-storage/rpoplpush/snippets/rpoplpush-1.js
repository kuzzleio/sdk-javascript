// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.rpoplpush('sourceKey', 'destKey', function (err, value) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.rpoplpushPromise('sourceKey', 'destKey')
  .then(value => {
    // resolved once the action has completed
  });
