// Using callbacks (NodeJS & Web Browser)
dataMapping.refresh(function (error, result) {
  // called once the mapping has been retrieved from Kuzzle
});

// Using promises (NodeJS)
dataMapping.refreshPromise().then(result => {
  // resolved once the mapping has been retrieved from Kuzzle
});
