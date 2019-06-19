// Using callbacks (node.js or browser)
kuzzle.createIndex('myIndex', function (err, res) {
  // callback called once the create operation has completed
  // => the result is a JSON object containing the raw Kuzzle response
});

// Using promises (node.js)
kuzzle
  .createIndexPromise('myIndex')
  .then(res => {
    // promise resolved once the create operation has completed
    // => the result is a JSON object containing the raw Kuzzle response
  });
