// Using callbacks (node.js or browser)
kuzzle.security.deleteCredentials('local', 'kuid', function (error, result) {

});

// Using promises (node.js)
kuzzle
  .security
  .deleteCredentialsPromise('local', 'kuid')
  .then(result => {

  });
