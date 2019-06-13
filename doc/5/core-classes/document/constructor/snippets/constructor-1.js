/*
 Constructors are not exposed in the JS/Node SDK.
 Document objects are returned by various Collection methods.

 You may also use the Collection.document() method:
 */
var document = kuzzle.collection('collection', 'index').document('id');

document = kuzzle
  .collection('collection', 'index')
  .document({content: 'some content'});

document = kuzzle
  .collection('collection', 'index')
  .document('id', {content: 'some content'});
