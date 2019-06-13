// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.geodist('key', 'Palermo', 'Catania', function (err, distance) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.geodistPromise('key', 'Palermo', 'Catania')
  .then(distance => {
    // resolved once the action has completed
  });
