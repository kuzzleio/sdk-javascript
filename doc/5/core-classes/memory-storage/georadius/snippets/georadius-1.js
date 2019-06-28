// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.georadius('key', 15, 37, 200, 'km', function (err, points) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.georadiusPromise('key', 15, 37, 200, 'km')
  .then(points => {
    // resolved once the action has completed
  });
