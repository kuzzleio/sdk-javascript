// Using callbacks (node.js or browser)
kuzzle.deleteMyCredentials('local', function (err, res) {
  console.log(res);     // {acknowledged: true}
});

// Using promises (node.js)
kuzzle
  .deleteMyCredentials('local')
  .then(res => {
    console.log(res);   // {acknowledged: true}
  });
