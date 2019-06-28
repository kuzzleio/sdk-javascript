var entries = [
  {key: 'key1', value: 'foo'},
  {key: 'key2', value: 'bar'},
  {key: '...', value: '...'}
];

// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.msetnx(entries, function (err, status) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.msetnxPromise(entries)
  .then(status => {
    // resolved once the action has completed
  });
