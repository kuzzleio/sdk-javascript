var entries = [
  {key: 'key1', value: 'foo'},
  {key: 'key2', value: 'bar'},
  {key: '...', value: '...'}
];

// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.mset(entries, function (err) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.msetPromise(entries)
  .then(() => {
    // resolved once the action has completed
  });
