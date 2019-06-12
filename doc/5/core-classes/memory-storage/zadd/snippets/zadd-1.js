var elements = [
  {'score': 1, 'member': 'foo'},
  {'score': 2, 'member': 'bar'},
  {'score': 3, 'member': 'baz'}
];

// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.zadd('key', elements, function (err, count) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.zaddPromise('key', elements)
  .then(count => {
    // resolved once the action has completed
  });
