// Using callbacks (NodeJS or Web Browser)
kuzzle
  .collection('collection', 'index')
  .mDeleteDocument(['doc1', 'doc2'], function (error, result) {
    // callback called once the mDelete operation has completed
    // => the result is a JSON object containing the raw Kuzzle response
  });

// Using promises (NodeJS only)
kuzzle
 .collection('collection', 'index')
 .mDeleteDocument()
 .then(result => {
   // promise resolved once the mDelete operation has completed
   // => the result is a JSON object containing the raw Kuzzle response
 });
