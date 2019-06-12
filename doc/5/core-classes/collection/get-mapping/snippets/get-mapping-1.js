// Using callbacks (NodeJS or Web Browser)
kuzzle
  .collection('collection', 'index')
  .getMapping(function (error, result) {
    // result is a CollectionMapping object
  });

// Using promises (NodeJS)
kuzzle
  .collection('collection', 'index')
  .getMappingPromise()
  .then(result => {
    // result is a CollectionMapping object
  });
