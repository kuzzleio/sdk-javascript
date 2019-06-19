// Using callbacks (NodeJS or Web Browser)
kuzzle.memoryStorage.georadiusbymember('key', 'Palermo', 200, 'km', function (err, points) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.georadiusbymemberPromise('key', 'Palermo', 200, 'km')
  .then(points => {
    // resolved once the action has completed
  });
