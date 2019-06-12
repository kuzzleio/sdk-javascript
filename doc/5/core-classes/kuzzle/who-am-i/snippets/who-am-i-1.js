// Using callbacks (NodeJS or Web Browser)
kuzzle.whoAmI(function (err, result) {
  // "result" is a User object
});

// Using promises (NodeJS only)
kuzzle.whoAmIPromise()
  .then(res => {
    // "res" is a User object
  });
