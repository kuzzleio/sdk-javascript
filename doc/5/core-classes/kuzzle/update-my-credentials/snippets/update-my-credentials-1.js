// Using callbacks (node.js or browser)
kuzzle.updateMyCredentials('local', {'username': 'foo'}, function (err, res) {
  console.log(res);     // {username: 'bar', kuid: '<kuid>'}
});

// Using promises (node.js)
kuzzle
  .updateMyCredentials('local', {'username': 'foo'})
  .then(res => {
    console.log(res);   // {username: 'foo', kuid: '<kuid>'}
  });
