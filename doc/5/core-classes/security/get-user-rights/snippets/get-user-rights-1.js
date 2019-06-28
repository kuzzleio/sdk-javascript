// Using callbacks (NodeJS or Web Browser)
kuzzle
  .security
  .getUserRights('kuid', function(error, rights) {

  });reflecting

// Using promises (NodeJS)
kuzzle
  .security
  .getUserRightsPromise('kuid')
  .then(rights => {

  });
