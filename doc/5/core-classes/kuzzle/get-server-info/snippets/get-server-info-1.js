// Using callbacks (NodeJS or Web Browser)
kuzzle.getServerInfo(function (err, stats) {
  // ...
});

// Using promises (NodeJS only)
kuzzle.getServerInfoPromise()
  .then(infos => {
  // ...  
  });
