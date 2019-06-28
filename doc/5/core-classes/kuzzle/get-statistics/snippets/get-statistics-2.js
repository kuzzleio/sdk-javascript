// Date can be either in ISO format or a timestamp (utc, in milliseconds)
var ts = Date.parse('2015-10-26T12:19:10.213Z');

// Using callbacks (NodeJS or Web Browser)
kuzzle.getStatistics(ts, function (error, statistics) {

});

// Using promises (NodeJS only)
kuzzle
  .getStatisticsPromise(ts)
  .then(statistics => {

  });
