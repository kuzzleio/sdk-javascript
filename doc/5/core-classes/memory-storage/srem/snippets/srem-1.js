// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.srem('key', ['member1', 'member2', '...'], function (err, count) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.sremPromise('key', ['member1', 'member2', '...'])
  .then(count => {
    // resolved once the action has completed
  });
