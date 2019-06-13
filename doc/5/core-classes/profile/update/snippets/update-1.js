var updateContent = {
  policies: [
    {roleId: 'myrole'},
  ]
};

// Using callbacks (NodeJS or Web Browser)
profile.update(updateContent, function(err, updatedProfile) {
  // the updatedProfile variable is the updated Profile object
})

// Using promises (NodeJS)
profile
  .updatePromise(updateContent)
  .then(updatedProfile => {
    // the updatedProfile variable is the updated Profile object
  });
