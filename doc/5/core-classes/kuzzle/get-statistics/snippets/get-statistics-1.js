// Using callbacks (NodeJS or Web Browser)
kuzzle.getStatistics(function (err, statistics) {
});

// Using promises (NodeJS only)
kuzzle
  .getStatisticsPromise()
  .then(statistics => {
  });
