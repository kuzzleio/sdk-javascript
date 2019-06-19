// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.zrevrangebylex('key', '-', '(g', function (err, members) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.zrevrangebylexPromise('key', '-', '(g')
  .then(members => {
    // resolved once the action has completed
  });
