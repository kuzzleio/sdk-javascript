// Using callbacks (node.js or browser)
kuzzle.security.validateCredentials('local', 'kuid', {'username': 'foo'}, function (error, result) {

});

// Using promises (node.js)
kuzzle
  .security
  .validateCredentialsPromise('local', 'kuid', {'username': 'foo'})
  .then(() => {

  });
