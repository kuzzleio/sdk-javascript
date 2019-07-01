const credentials = { username: 'foo', password: 'bar' };

try {
  await kuzzle.auth.login('local', credentials);

  const exists = await kuzzle.auth.credentialsExist('local');

  if (exists === true) {
    console.log('Credentials exist');
  }
} catch (error) {
  console.error(error.message);
}
