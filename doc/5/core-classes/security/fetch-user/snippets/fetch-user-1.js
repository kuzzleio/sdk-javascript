// Using callbacks (NodeJS or Web Browser)
kuzzle
  .security
  .fetchUser('myuser', function(error, result) {
    // result is a User object
  })

// Using promises (NodeJS)
kuzzle
  .security
  .fetchUserPromise('myuser')
  .then((result) => {
    // result is a User object
  })
