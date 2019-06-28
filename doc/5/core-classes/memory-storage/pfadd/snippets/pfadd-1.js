// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.pfadd('key', ['foo', 'bar', 'baz'], function (err, status) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.pfaddPromise('key', ['foo', 'bar', 'baz'])
  .then(status => {
    // resolved once the action has completed
  });
