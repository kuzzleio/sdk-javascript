// Using callbacks (NodeJS or Web Browser)
kuzzle.checkToken(token, function (err, res) {
  // ...
});

// Using promises (NodeJS only)
kuzzle.checkTokenPromise(token)
  .then(res => {
    // ...
  });
