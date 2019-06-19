// Using callbacks (NodeJS or Web Browser)
user
  .save(function(error, result) {
    // result is a User object
  });

// Using promises (NodeJS)
user
  .savePromise()
  .then((result) => {
    // result is a User object
  });
