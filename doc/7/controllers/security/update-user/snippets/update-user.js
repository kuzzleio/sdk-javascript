try {
  const response = await kuzzle.security.updateUser(
    'john.doe',
    {
      profileIds: ['default'],
      firstName: 'John',
      lastName: 'Doe'
    }
  );

  console.log(response);
  /*
  User {
    _id: 'john.doe',
    content:,
      { profileIds: [ 'default' ],
        fullName: 'John Doe',
        _kuzzle_info:
          { author: '-1',
            createdAt: 1561379086534,
            updatedAt: null,
            updater: null } } }
   */

} catch (e) {
  console.error(e);
}
