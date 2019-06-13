kuzzle
  .collection('collection', 'index')
  .setHeaders({
    someContent: 'someValue',
    volatile: { someVolatileData: ['with', 'some', 'values']}
  }, true);
