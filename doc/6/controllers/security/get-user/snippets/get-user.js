try {
  const response = await kuzzle.security.getUser('john.doe');

  console.log(response);
  /*
  User {
    _id: 'john.doe',
    content:
      { profileIds: [ 'default' ],
        fullName: 'John Doe',
        _kuzzle_info:
        { author: -1,
          createdAt: 1561447939790,
          updatedAt: null,
          updater: null } } }
   */
} catch (e) {
  console.error(e);
}
