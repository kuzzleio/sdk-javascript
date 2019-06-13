// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.hmget('key', ['field1', 'field2', '...'], function (err, values) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.hmgetPromise('key', ['field1', 'field2', '...'])
  .then(values => {
    // resolved once the action has completed
  });
