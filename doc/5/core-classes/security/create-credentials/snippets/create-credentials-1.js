// Using callbacks (node.js or browser)
kuzzle.security.createCredentials('local', 'kuid', {'username': 'foo'}, function (error, credentials) {

});

// Using promises (node.js)
kuzzle
  .security
  .createCredentialsPromise('local', 'kuid', {'username': 'foo'})
  .then(credentials => {

  });
