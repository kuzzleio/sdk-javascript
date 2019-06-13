var user = kuzzle.security.fetchUser('myuser');
var userContent = {
  profileIds: ['profileId']
};

user = user.setContent(userContent);
