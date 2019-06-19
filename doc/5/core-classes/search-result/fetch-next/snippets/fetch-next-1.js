// Using callbacks (NodeJS or Web Browser)
searchResult.fetchNext(function (error, nextSearchResult) {
  // called once the fetchNext action has been completed
  // nextSearchResult is an instantiated SearchResult object
});

// Using promises (NodeJS)
searchResult.fetchNextPromise()
  .then(nextSearchResult => {
    // called once the fetchNext action has been completed
    // nextSearchResult is an instantiated SearchResult object
  });
