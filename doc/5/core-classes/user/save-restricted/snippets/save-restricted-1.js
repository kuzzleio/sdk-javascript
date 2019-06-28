// Using callbacks (NodeJS or Web Browser)
user
  .saveRestricted(function(error, result) {
    // result is a User object
  });

// Using promises (NodeJS)
user
  .saveRestrictedPromise()
  .then(result => {
    // result is a User object
  });
