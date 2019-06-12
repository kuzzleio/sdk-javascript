// Using callbacks (NodeJS or Web Browser)
kuzzle.listCollections('index', {type: 'stored', from: 0, size: 42}, function (err, collections) {
  // ...
});

// Using promises (NodeJS only)
kuzzle
  .listCollectionsPromise('index', {type: 'stored'})
  .then(collections => {
    // ...
  });
