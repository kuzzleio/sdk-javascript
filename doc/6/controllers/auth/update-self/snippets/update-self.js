const credentials = { username: 'foo', password: 'bar' };

try {
  await kuzzle.auth.login('local', credentials);

  const user = await kuzzle.auth.updateSelf({ hungry: 'music' });
  console.log(user);
  /*
    User {
      _id: 'foo',
      content:
       { profileIds: [ 'default' ],
         hungry: 'music',
         _kuzzle_info:
          { author: '-1',
            createdAt: 1540210776636,
            updatedAt: null,
            updater: null } } }
  */

  console.log('Success');
} catch (error) {
  console.error(error.message);
}
