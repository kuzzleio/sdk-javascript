/*
 Constructors are not exposed in the JS/Node SDK.
 Room objects are returned by Collection.subscribe and
 Document.subscribe methods.

 You may also use the Collection.room() method:
 */
var room = kuzzle.collection('collection', 'index').room();

room = kuzzle
  .collection('collection', 'index')
  .room({subscribeToSelf: false});
