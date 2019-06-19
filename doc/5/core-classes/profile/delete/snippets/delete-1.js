// Using callbacks (NodeJS or Web Browser)
profile
  .delete(function(error, result) {
    // result is the id of deleted profile
  });

// Using promises (NodeJS)
profile
  .deletePromise()
  .then((result) => {
    // result is the id of deleted profile
  });
