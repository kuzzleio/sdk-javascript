let dataMapping = kuzzle
  .collection('collection', 'index')
  .collectionMapping({someField: {type: 'string', index: 'analyzed'}})
  .apply(function (error, result) {
    // called once the mapping action has been completed
  });
