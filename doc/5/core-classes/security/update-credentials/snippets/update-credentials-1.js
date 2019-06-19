// Using callbacks (node.js or browser)
kuzzle.security.updateCredentials('local', 'kuid', {'username': 'foo'}, function (error, updatedCredentials) {

});

// Using promises (node.js)
kuzzle
  .security
  .updateCredentialsPromise('local', 'kuid', {'username': 'foo'})
  .then(updatedCredentials => {

  });
