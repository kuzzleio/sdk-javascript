// Using callbacks (NodeJS or Web Browser)
kuzzle
  .collection('collection', 'index')
  .truncate(function (error, result) {
    // callback called once the truncate operation has completed
    // => the result is a JSON object containing the raw Kuzzle response
  });

// Using promises (NodeJS only)
kuzzle
 .collection('collection', 'index')
 .truncatePromise()
 .then(result => {
   // promise resolved once the truncate operation has completed
   // => the result is a JSON object containing the raw Kuzzle response
 });
