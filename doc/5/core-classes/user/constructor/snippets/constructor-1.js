/*
 Constructors are not exposed in the JS/Node SDK.
 User objects are returned by Security.user method:
 */
 var userContent = {
   // A "profile" field is required to bind a user to an existing profile
   profileIds: ['admin'],

   // The "local" authentication strategy requires a password
   password: 'secretPassword',

   // You can also set custom fields to your user
   firstname: 'John',
   lastname: 'Doe'
 };

var user = kuzzle.security.user('myuser', userContent);
