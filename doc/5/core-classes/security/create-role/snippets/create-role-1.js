var roleDefinition = {
  controllers: {
    "*": {
      actions: {
        "*": true
      }
    }
  }
};

// You can chose to replace the given role if already exists
var options = {
  replaceIfExist: true
};

// Using callbacks (NodeJS or Web Browser)
kuzzle
  .security
  .createRole('myrole', roleDefinition, options, function(error, response) {
    // result is a Role object
  });

// Using promises (NodeJS)
kuzzle
  .security
  .createRolePromise('myrole', roleDefinition, options)
  .then((response) => {
    // result is a Role object
  });
