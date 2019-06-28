// Using callbacks (NodeJS or Web Browser)
var points = [
  {
    lon: 13.361389,
    lat: 38.115556,
    name: 'Palermo'
  },
  {
    lon: 15.087269,
    lat: 37.502669,
    name: 'Catania'
  }
];

kuzzle.memoryStorage.geoadd('key', points, function (err, count) {
  // callback called once the action has completed
});

// Using promises (NodeJS only)
kuzzle.memoryStorage.geoaddPromise('key', points)
  .then(count => {
    // resolved once the action has completed
  });
