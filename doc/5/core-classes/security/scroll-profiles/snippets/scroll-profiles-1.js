// Using callbacks (NodeJS or Web Browser)
kuzzle
  .security
  .scrollProfiles(scrollId, options, function(error, result) {
    // called once the scroll action has been completed
  });
