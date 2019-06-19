// Using callbacks (NodeJS or Web Browser)
kuzzle
  .collection('collection', 'index')
  .createDocument('foobar', {title: 'foo', content: 'bar'}, {ifExist: 'replace'}, function (err, res) {
    // callback called once the create action has been completed
    // => the result is a Document object
  });

// Using promises (NodeJS only)
kuzzle
 .collection('collection', 'index')
 .createDocumentPromise('foobar', {title: 'foo', content: 'bar'}, {ifExist: 'replace'})
 .then(res => {
   // promise resolved once the create action has been completed
   // => the result is a Document object
 });
