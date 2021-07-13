kuzzle.authenticator = async () => {
  await kuzzle.auth.login('local', { username: 'foo', password: 'bar' });
};

try {
  const jwt = await kuzzle.authenticate();
  console.log(jwt);
  /*
    'eyJhbGciOiJIUzI1NiIsIkpXVCJ9.eyJfaWQiOiJmb28iLCJpYXQiOjE.wSPmb0z2tErRdYEg'
  */
  console.log('Success');
} catch (error) {
  console.error(error.message);
}
