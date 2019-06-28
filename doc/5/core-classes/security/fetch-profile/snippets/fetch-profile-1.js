// Using callbacks (NodeJS or Web Browser)
kuzzle
  .security
  .fetchProfile('myprofile', function(error, result) {
    // result is a Profile object
  });

// Using promises (NodeJS)
kuzzle
  .security
  .fetchProfilePromise('myprofile')
  .then((result) => {
    // result is a Profile object
  });
