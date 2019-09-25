const credentials = { username: 'foo', password: 'bar' };

try {
  await kuzzle.auth.login('local', credentials);

  const success = await kuzzle.auth.deleteMyCredentials('local');
  console.log(success);
  if (success === true) {
    console.log('Credentials successfully deleted');
  }
} catch (error) {
  console.error(error.message);
}
