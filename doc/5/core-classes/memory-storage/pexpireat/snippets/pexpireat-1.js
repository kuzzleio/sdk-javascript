// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.pexpireat('key', 1488540242465, function (err, status) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.pexpireatPromise('key', 1488540242465)
  .then(status => {
    // resolved once the action has completed
  });
