const credentials = { username: 'foo', password: 'bar' };

try {
  await kuzzle.auth.login('local', credentials);

  const strategies = await kuzzle.auth.getStrategies();
  console.log(strategies);
  /*
    [ 'local', 'facebook' ]
  */

  console.log('Success');
} catch (error) {
  console.error(error.message);
}
