var userContent = {
  content: {
  },
  credentials: {
    local: {
      // The "local" authentication strategy requires a password
      password: 'secretPassword',
      lastLoggedIn: 1494411803
    }
  }
};


// Using callbacks (NodeJS or Web Browser)
kuzzle
  .security
  .createRestrictedUser('myuser', userContent, options, function(error, response) {
    // result is a User object
  });

// Using promises (NodeJS)
kuzzle
  .security
  .createRestrictedUserPromise('myuser', userContent, options)
  .then((response) => {
    // result is a User object
  });
