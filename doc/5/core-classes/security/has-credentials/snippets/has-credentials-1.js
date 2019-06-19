// Using callbacks (node.js or browser)
kuzzle.security.hasCredentials('local', 'kuid', function (error, result) {

});

// Using promises (node.js)
kuzzle
  .security
  .hasCredentialsPromise('local', 'kuid')
  .then(result => {

  });
