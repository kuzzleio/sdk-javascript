// Using callbacks (node.js or browser)
kuzzle.createMyCredentials('local', {'username': 'foo'}, function (err, res) {
  console.log(res);     // {username: 'bar', kuid: '<kuid>'}
});

// Using promises (node.js)
kuzzle
  .createMyCredentials('local', {'username': 'foo'})
  .then(res => {
    console.log(res);   // {username: 'foo', kuid: '<kuid>'}
  });
