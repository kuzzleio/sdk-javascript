kuzzle.authenticator = async () => {
  await kuzzle.auth.login('local', { username: 'foo', password: 'bar' });
};

try {
  await kuzzle.authenticate();

  console.log('Success');
} catch (error) {
  console.error(error.message);
}
