// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.ltrim('key', 1, 2, function (err) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.ltrimPromise('key', 1, 2)
  .then(() => {
    // resolved once the action has completed
  });
