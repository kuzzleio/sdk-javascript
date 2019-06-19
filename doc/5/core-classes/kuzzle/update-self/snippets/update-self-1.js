var newContent = {
  firstname: 'My Name Is',
  lastname: 'Jonas'
};


// Using callbacks (NodeJS or Web Browser)
kuzzle
  .updateSelf(newContent, function (err, updatedUser) {

  });

// Using promises (NodeJS)
kuzzle
  .updateSelfPromise(newContent)
  .then(updatedUser => {

  });
