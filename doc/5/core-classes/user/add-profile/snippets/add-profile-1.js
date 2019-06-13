var profile = kuzzle.security.fetchProfile('myprofile', function(error, profile) {
  // Can add a profile directly with a Profile object
  user.addProfile(profile);
});

// Or by passing an id
user.addProfile('myprofile');
