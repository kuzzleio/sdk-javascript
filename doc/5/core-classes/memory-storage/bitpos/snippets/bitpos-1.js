// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.bitpos('key', 0, function (err, position) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.bitpos('key', 0)
  .then(position => {
    // resolved once the action has completed
  });
