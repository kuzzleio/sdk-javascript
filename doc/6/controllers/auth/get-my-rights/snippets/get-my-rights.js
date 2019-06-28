const credentials = { username: 'foo', password: 'bar' };

try {
  await kuzzle.auth.login('local', credentials);

  const rights = await kuzzle.auth.getMyRights();
  console.log(rights);
  /*
    [ { controller: '*',
      action: '*',
      collection: '*',
      index: '*',
      value: 'allowed' } ]
  */

  console.log('Success');
} catch (error) {
  console.error(error.message);
}
