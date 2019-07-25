try {
  const response = await kuzzle.security.createFirstAdmin(
    'admin',
    {
      content: {
        firstName: 'John',
        lastName: 'Doe'
      },
      credentials: {
        local: {
          username: 'admin',
          password: 'myPassword'
        }
      }
    }
  );

  console.log(response);
  /*
  User {
    _id: 'admin',
    content:
      { profileIds: [ 'admin' ],
        firstName: 'John',
        lastName: 'Doe',
        _kuzzle_info:
          { author: '-1',
            createdAt: 1560351009496,
            updatedAt: null,
            updater: null  } } }
   */

  console.log('First admin successfully created');

} catch (e) {
  console.error(e);
}
