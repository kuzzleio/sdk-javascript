var processDocument = function (document) {
  // do something with the document
};

kuzzle
  .collection('collection', 'index')
  .search({
    from: 0,
    size: 1000,
    scroll: '30s',
    query: {}
  }, function getMoreUntilDone (error, searchResult) {
    if (searchResult === null) {
      return;
    }
    
    searchResult.documents.forEach(function (document) {
      processDocument(document);
    });
    
    searchResult.fetchNext(getMoreUntilDone);
  });
