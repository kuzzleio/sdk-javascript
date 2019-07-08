try {
  const response = await kuzzle.security.createRestrictedUser({
    content: {
      fullName: 'John Doe'
    },
    credentials: {
      local: {
        username: 'jdoe',
        password: 'foobar'
      }
    }
  }, 'jdoe');
  console.log(response);

  /*
  User {
    _id: 'jdoe',
    content:,
      { profileIds: [ 'default' ],
        fullName: 'John Doe',
        _kuzzle_info:
          { author: '-1',
            createdAt: 1561379086534,
            udpatedAt: null,
            updater: null } } }
   */

  console.log('User successfully created');
} catch (e) {
  console.error(e);
}
