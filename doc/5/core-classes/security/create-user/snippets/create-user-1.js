var user = {
  content: {
    // A "profileIds" field is required to bind a user to existing profiles
    profileIds: ['admin'],

    // Additional information may be provided
    firstname: 'John',
    lastname: 'Doe'
  },
  credentials: {
    // Authentication strategy to use
    "local": {
      // The necessary information to provide vary,
      // depending on the chosen authentication strategy
      "username": "jdoe",
      "password": "secret password"
    }
  }
};

var options = {};


// Using callbacks (NodeJS or Web Browser)
kuzzle
  .security
  .createUser('myuser', user, options, function(error, response) {
    // result is a User object
  });

// Using promises (NodeJS)
kuzzle
  .security
  .createUserPromise('myuser', user, options)
  .then(response => {
    // result is a User object
  });
