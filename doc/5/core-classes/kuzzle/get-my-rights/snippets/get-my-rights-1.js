// Using callbacks (NodeJS or Web Browser)
kuzzle
  .getMyRights(function(error, rights) {
    // result is an array of objects
  });

// Using promises (NodeJS)
kuzzle
  .getMyRightsPromise()
  .then(rights => {
    // result is an array of objects
  });
