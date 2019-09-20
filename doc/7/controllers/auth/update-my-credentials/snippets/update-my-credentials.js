const credentials = { username: 'foo', password: 'bar' };

try {
  await kuzzle.auth.login('local', credentials);

  const response = await kuzzle.auth.updateMyCredentials(
    'local',
    { password: 'worakls' }
  );
  console.log(response);
  /*
    { username: 'foo' }
  */

  console.log('Success');
} catch (error) {
  console.error(error.message);
}
