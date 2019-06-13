// Deleting one document using callbacks (NodeJS or Web Browser)
kuzzle
  .collection('collection', 'index')
  .deleteDocument('document unique ID', function (err, res) {
    // callback called once the delete action has been completed
  });

// Deleting one document using promises (NodeJS)
kuzzle
  .collection('collection', 'index')
  .deleteDocumentPromise('document unique ID')
  .then(res => {
    // promises resolved once the delete action has been completed
  });

// Deleting multiple documents using callbacks (NodeJS or Web Browser)
kuzzle
  .collection('collection', 'index')
  .deleteDocument({filter: {equals: {title: 'foo'}}}, function (err, res) {
    // callback called once the delete with query has been completed
  });

// Deleting multiple documents using promises (NodeJS)
 kuzzle
 .collection('collection', 'index')
 .deleteDocumentPromise({filter: {equals: {title: 'foo'}}})
 .then(res => {
   // promise resolved once the delete by query has been completed
 });
