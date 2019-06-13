// Using callbacks (node.js or browser)
kuzzle.getMyCredentials('local', function (error, credentials) {

});

// Using promises (node.js)
kuzzle
  .getMyCredentialsPromise('local')
  .then(credentials => {

  });
