var entries = [
  {"field": "field1", "value": "foo"},
  {"field": "field2", "value": "bar"},
  {"field": "...", "value": "..."}
];

// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.hmset('key', entries, function (err) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.hmsetPromise('key', entries)
  .then(() => {
    // resolved once the action has completed
  });
