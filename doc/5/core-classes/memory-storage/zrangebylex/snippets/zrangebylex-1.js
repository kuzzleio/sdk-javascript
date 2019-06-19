// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.zrangebylex('key', '-', '(g', function (err, members) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.zrangebylexPromise('key', '-', '(g')
  .then(members => {
    // resolved once the action has completed
  });
