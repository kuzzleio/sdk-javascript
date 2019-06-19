// Using callbacks (NodeJS or Web Browser)
kuzzle
  .collection('collection', 'index')
  .scroll(scrollId, {scroll: '1m'}, function (err, searchResult) {
    searchResult.getDocuments().forEach(function (document) {
      console.log(document.toString());
    });
  });

// Using promises (NodeJS only)
kuzzle
  .collection('collection', 'index')
  .scrollPromise(scrollId, {scroll: '1m'})
  .then(searchResult => {
    searchResult.getDocuments().forEach(document => {
      console.log(document.toString());
    });
  });
