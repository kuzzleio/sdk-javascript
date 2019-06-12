// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.append('key', 'value', function (err, newLength) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.appendPromise('key', 'value')
  .then(newLength => {
    // resolved once the action has completed
  });
