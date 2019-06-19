var roleDefinition = {
  controllers: {
    "read": {
      actions: {
        "get": true
      }
    }
  }
};

// Using callbacks (NodeJS or Web Browser)
kuzzle
  .security
  .updateRole("role ID", roleDefinition, function (err, updatedRole) {
    // "updatedRole" is an instance of a Role object
  });

// Using promises (NodeJS)
kuzzle
  .security
  .updateRolePromise("profile ID", roleDefinition)
  .then(updatedRole => {
    // "updatedRole" is an instance of a Role object
  });
