// Using callbacks (NodeJS or Web Browser)
kuzzle
  .security
  .fetchRole('myrole', function(error, result) {
    // result is a Role object
  });

// Using promises (NodeJS)
kuzzle
  .security
  .fetchRolePromise('myrole')
  .then((result) => {
    // result is a Role object
  });
