// Using callbacks (NodeJS or Web Browser)
role
  .save(function(error, result) {
    // result is a Role object
  });

// Using promises (NodeJS)
role
  .savePromise()
  .then((result) => {
    // result is a Role object
  });
