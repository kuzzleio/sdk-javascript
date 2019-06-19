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

// Using callbacks (NodeJS or Web Browser)
kuzzle
  .security
  .updateProfile("profile ID", policies, function (err, updatedProfile) {
    
  });

// Using promises (NodeJS)
kuzzle
  .security
  .updateProfilePromise("profile ID", policies)
  .then(updatedProfile => {
    
  });
