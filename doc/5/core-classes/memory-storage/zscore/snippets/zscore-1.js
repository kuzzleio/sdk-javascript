// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.zscore('key', 'bar', function (err, score) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.zscorePromise('key', 'bar')
  .then(score => {
    // resolved once the action has completed
  });
