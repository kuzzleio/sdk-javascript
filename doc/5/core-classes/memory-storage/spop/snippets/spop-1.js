// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.spop('key', function (err, elements) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.spopPromise('key')
  .then(elements => {
    // resolved once the action has completed
  });
