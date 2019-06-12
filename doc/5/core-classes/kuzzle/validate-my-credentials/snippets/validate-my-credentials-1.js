// Using callbacks (node.js or browser)
kuzzle.validateMyCredentials('local', {'username': 'foo'}, function (err, res) {
  console.log(res);     // true or false
});

// Using promises (node.js)
kuzzle
  .validateMyCredentials('local', {'username': 'foo'})
  .then(res => {
    console.log(res);   // true or false
  });
