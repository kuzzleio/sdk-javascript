// Using callbacks (NodeJS or Web Browser)
kuzzle
  .collection('collection', 'index')
  .count({}, function (err, res) {
    // ...
  });

// Using promises (NodeJS only)
kuzzle
 .collection('collection', 'index')
 .countPromise({})
 .then(res => {
   // ...
 });
