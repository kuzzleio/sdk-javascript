var updateContent = {
  firstname: 'My Name Is',
  lastname: 'Jonas'
};

// Using callbacks (NodeJS or Web Browser)
user.update(updateContent, function(err, updatedUser) {
  // the updatedUser variable is the updated User object
});

// Using promises (NodeJS)
role
  .updatePromise(updateContent)
  .then(updatedUser => {
    // the updatedUser variable is the updated User object
  });
