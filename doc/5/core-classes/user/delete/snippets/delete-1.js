// Using callbacks (NodeJS or Web Browser)
user
  .delete(function(error, result) {
    // result is the id of deleted user
  });

// Using promises (NodeJS)
user
  .deletePromise()
  .then(result => {
    // result is the id of deleted user
  });
