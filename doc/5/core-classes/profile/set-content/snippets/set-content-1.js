var profile = kuzzle.security.fetchProfile('myprofile');
var profileDefinition = {
  policies: [
    {roleId: 'myrole'},
    {roleId: 'default', restrictedTo: [{index: 'index1'}, {index: 'index2', collections: ['foo', 'bar'] } ] }
  ]
};

profile = profile.setContent(profileDefinition);
