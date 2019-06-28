// Using callbacks (NodeJS or Web Browser)
kuzzle.getAllStatistics(function (err, stats) {
  stats.forEach(function (frame) {
    // loop through all returned frames
  });
});

// Using promises (NodeJS only)
kuzzle
  .getAllStatisticsPromise()
  .then(stats => {
    stats.forEach(function (frame) {
      // loop through all returned frames
    });
  });
