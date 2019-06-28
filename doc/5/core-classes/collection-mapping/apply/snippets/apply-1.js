// Using callbacks (NodeJS or Web Browser)
dataMapping.apply(function (error, result) {
  // called once the mapping action has been completed
});

// Using promises (NodeJS)
dataMapping.applyPromise().then(function (error, result) {
  // resolved once the mapping action has been completed
});
