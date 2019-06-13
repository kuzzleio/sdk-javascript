// Expiration time is expressed as a string following the
// time conversion library: https://www.npmjs.com/package/ms
 var expiresIn = "1h";

// Using callbacks (NodeJS or Web Browser)
kuzzle.login("local", {username: "username", password: "password"}, expiresIn, function (err, res) {
  // ...
});

// Using promises (NodeJS only)
kuzzle.loginPromise("local", {username: "username", password: "password"}, expiresIn)
  .then(res => {
    // ...
  });
