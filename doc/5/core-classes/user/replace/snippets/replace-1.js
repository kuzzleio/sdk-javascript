// Using callbacks (NodeJS or Web Browser)
user
  .replace(function(error, result) {
    // result is a User object
  });

// Using promises (NodeJS)
user
  .replacePromise()
  .then(result => {
    // result is a User object
  });
