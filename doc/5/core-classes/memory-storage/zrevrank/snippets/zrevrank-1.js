// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.zrevrank('key', 'foo', function (err, position) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.zrevrankPromise('key', 'foo')
  .then(position => {
    // resolved once the action has completed
  });
