// Using callbacks (NodeJS or Web Browser)
kuzzle.now(function (err, res) {
  // 'res' contains the Kuzzle timestamp (utc, in milliseconds)
});

// Using promises (NodeJS only)
kuzzle.nowPromise().then(res => {
  // 'res' contains the Kuzzle timestamp (utc, in milliseconds)
});
