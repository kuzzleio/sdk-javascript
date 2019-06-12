// Any API request method behave the same way

// Using callbacks (NodeJS or Web Browser)
kuzzle.checkToken(token, function (err, res) {
  if (err) {
    console.error(err.status, ': ', err.message);
    return;
  }
});

// Using promises (NodeJS only)
kuzzle.checkTokenPromise(token)
  .then(res => {
    // ...
  })
  .catch(err => {
    console.error(err.status, ': ', err.message);
    return Promise.reject(err);
  });
