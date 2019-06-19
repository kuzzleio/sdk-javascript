var profile = kuzzle.security.fetchProfile('myprofile', function(error, profile) {
  // Can set the profiles directly with a Profile object
  user.setProfiles([profile]);
});

// Or by passing their ids
user.setProfiles(['myprofile']);
