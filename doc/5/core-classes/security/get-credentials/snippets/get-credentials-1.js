// Using callbacks (node.js or browser)
kuzzle.security.getCredentials('local', 'kuid', function (error, credentials) {

});

// Using promises (node.js)
kuzzle
  .security
  .getCredentialsPromise('local', 'kuid')
  .then(credentials => {

  });
