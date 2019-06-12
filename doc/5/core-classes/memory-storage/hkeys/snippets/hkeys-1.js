// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.hkeys('key', function (err, fields) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.hkeysPromise('key')
  .then(fields => {
    // resolved once the action has completed
  });
