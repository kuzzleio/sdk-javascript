// Using callbacks (NodeJS or Web Browser)
kuzzle
  .collection('collection', 'index')
  .mGetDocument(['doc1', 'doc2'], function (error, result) {
    // callback called once the mGet operation has completed
    // => the result is a JSON object containing the raw Kuzzle response
  });

// Using promises (NodeJS only)
kuzzle
 .collection('collection', 'index')
 .mGetDocument()
 .then(result => {
   // promise resolved once the mGet operation has completed
   // => the result is a JSON object containing the raw Kuzzle response
 });
