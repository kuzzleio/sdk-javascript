// Using callbacks (NodeJS or Web Browser)
user
  .create(function(error, result) {
    // result is a User object
  });

// Using promises (NodeJS)
user
  .createPromise()
  .then(result => {
    // result is a User object
  });
