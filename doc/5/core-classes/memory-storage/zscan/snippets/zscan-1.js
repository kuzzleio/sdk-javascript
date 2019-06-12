// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.zscan('key', 0, function (err, page) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.zscanPromise('key', 0)
  .then(page => {
    // resolved once the action has completed
  });
