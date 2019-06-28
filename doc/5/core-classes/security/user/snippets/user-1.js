var userContent = {
  // A "profileIds" field is required to bind a user to an existing profile
  profileIds: ['some profile'],

  // The "local" authentication strategy requires a password
  password: 'secretPassword',

  // You can also set custom fields to your user
  firstname: 'John',
  lastname: 'Doe'
};

var user = kuzzle.security.user('myuser', userContent);
