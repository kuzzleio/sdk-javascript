// Using callbacks (NodeJS or Web Browser)
user
  .getProfiles(function(error, profiles) {
    // result is an array of Profile objects
  });

// Using promises (NodeJS)
user
  .getProfilesPromise()
  .then(profiles => {
    // profiles is an array of Profile objects
  });
