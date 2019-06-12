/*
 Constructors are not exposed in the JS/Node SDK.
 CollectionMapping objects are returned by the method
 Collection.getMapping

 You may also use the Collection.collectionMapping() method:
 */
var mapping = kuzzle.collection('collection', 'index').collectionMapping();

mapping = kuzzle.collection('collection', 'index').collectionMapping(mapping);
