// Using callbacks (node.js or browser)
kuzzle.security.getCredentialFields('local', function (error, fields) {

});

// Using promises (node.js)
kuzzle
  .security
  .getCredentialFieldsPromise('local')
  .then(fields => {

  });
