var profileDefinition = {
  policies: [
    {roleId: 'myrole'},
    {roleId: 'default', restrictedTo: [{index: 'index1'}, {index: 'index2', collections: ['foo', 'bar'] } ] }
  ]
};

var profile = kuzzle.security.profile('myprofile', profileDefinition);

// Using callbacks (NodeJS or Web Browser)
profile
  .save(function(error, result) {
    // result is a Profile object
  });

// Using promises (NodeJS)
profile
  .savePromise()
  .then(result => {
    // result is a Profile object
  });
