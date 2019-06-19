var newContent = {
  profileIds: ['admin'],
  firstname: 'My Name Is',
  lastname: 'Jonas'
};


// Using callbacks (NodeJS or Web Browser)
kuzzle
  .security
  .replaceUser("User ID", newContent, function (err, replacedUser) {
    // "replacedUser" is an instance of a User object
  });
