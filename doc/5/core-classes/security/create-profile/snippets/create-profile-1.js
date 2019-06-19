var policies = [
  {roleId: 'myrole'},
  {
    roleId: 'default', 
    restrictedTo: [
      {index: 'index1'}, 
      {index: 'index2', collections: ['foo', 'bar'] } 
    ] 
  }
];

// You can chose to replace the given profile if already exists
var options = {
  replaceIfExist: true
};

// Using callbacks (NodeJS or Web Browser)
kuzzle
  .security
  .createProfile('myprofile', policies, options, function(error, profile) {

  });

// Using promises (NodeJS)
kuzzle
  .security
  .createProfilePromise('myprofile', policies, options)
  .then(profile => {

  });
