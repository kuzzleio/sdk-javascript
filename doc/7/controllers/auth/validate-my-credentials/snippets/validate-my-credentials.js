const credentials = { username: 'foo', password: 'bar' };

try {
  await kuzzle.auth.login('local', credentials);

  const valid = await kuzzle.auth.validateMyCredentials('local', credentials);

  if (valid === true) {
    console.log('Credentials are valid');
  }
} catch (error) {
  console.error(error.message);
}
