// Using callbacks (NodeJS or Web Browser)
kuzzle
  .collection('collection', 'index')
  .fetchDocument('documentId', function (error, result) {
    // result is a Document object
  });

// Using promises (NodeJS)
kuzzle
  .collection('collection', 'index')
  .fetchDocumentPromise('documentId')
  .then(result => {
    // result is a Document object
  });
