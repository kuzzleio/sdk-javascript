var
  Document = require('./src/Document'),
  firstDocument = new Document(collection, 'doc1', {title: 'foo', content: 'bar'}),
  secondDocument = new Document(collection, 'doc2', {title: 'foo', content: 'bar'});

// Using callbacks (NodeJS or Web Browser)
kuzzle
  .collection('collection', 'index')
  .mCreateOrReplaceDocument([firstDocument, secondDocument], function (error, result) {
    // callback called once the mCreateOrReplace operation has completed
    // => the result is a JSON object containing the raw Kuzzle response
  });

// Using promises (NodeJS only)
kuzzle
 .collection('collection', 'index')
 .mCreateOrReplaceDocumentPromise([firstDocument, secondDocument])
 .then(result => {
   // promise resolved once the mCreateOrReplace operation has completed
   // => the result is a JSON object containing the raw Kuzzle response
 });
