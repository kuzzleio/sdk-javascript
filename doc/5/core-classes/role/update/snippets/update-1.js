var updateContent = {
  controllers: {
    "document": {
      actions: {
        "get": true
      }
    }
  }
};

// Using callbacks (NodeJS or Web Browser)
role.update(updateContent, function(err, updatedRole) {
  // the updatedRole variable is the updated Role object
})

// Using promises (NodeJS)
role
  .updatePromise(updateContent)
  .then(updatedRole => {
    // the updatedRole variable is the updated Role object
  });
