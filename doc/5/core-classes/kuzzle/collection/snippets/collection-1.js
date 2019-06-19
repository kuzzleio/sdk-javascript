var collection = kuzzle.collection('collection', 'index');

// or using a default index:
var
  kuzzle = new Kuzzle('localhost', {defaultIndex: 'index'});

collection = kuzzle.collection('collection');
