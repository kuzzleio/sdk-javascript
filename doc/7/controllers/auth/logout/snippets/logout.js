const credentials = { username: 'foo', password: 'bar' };

try {
  await kuzzle.auth.login('local', credentials);

  await kuzzle.auth.logout();

  console.log('Success');
} catch (error) {
  console.error(error.message);
}
