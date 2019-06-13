// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.geopos('key', ['Palermo', 'Catania'], function (err, positions) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.geoposPromise('key', ['Palermo', 'Catania'])
  .then(positions => {
    // resolved once the action has completed
  });
