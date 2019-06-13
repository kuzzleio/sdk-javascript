// Using callbacks (NodeJS or Web Browser)
kuzzle
  .collection('collection', 'index')
  .replaceDocument('documentId', {title: 'foo', content: 'bar'}, function (error, result) {
    // result is a Document object
  });

// Using promises (NodeJS)
kuzzle
  .collection('collection', 'index')
  .replaceDocumentPromise('documentId', {title: 'foo', content: 'bar'})
  .then(result => {
    // result is a Document object
  });
