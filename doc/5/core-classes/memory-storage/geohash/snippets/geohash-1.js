// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.geohash('key', ['Palermo', 'Catania'], function (err, hashes) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.geohashPromise('key', ['Palermo', 'Catania'])
  .then(hashes => {
    // resolved once the action has completed
  });
