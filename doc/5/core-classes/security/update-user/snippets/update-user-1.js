var newContent = {
  firstname: 'My Name Is',
  lastname: 'Jonas'
};


// Using callbacks (NodeJS or Web Browser)
kuzzle
  .security
  .updateUser("User ID", newContent, function (err, updatedUser) {
    // "updatedUser" is an instance of a User object
  });

// Using promises (NodeJS)
kuzzle
  .security
  .updateUserPromise("User ID", newContent)
  .then(updatedUser => {
    // "updatedUser" is an instance of a User object
  });
